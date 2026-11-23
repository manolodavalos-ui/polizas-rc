"use client";
import { useState } from "react";
import { CloudDownload, WifiOff } from "lucide-react";
import { getDiasAviso, listarAsegurados, listarPolizas, listarTodosDocumentos } from "@/lib/datos";

const KEY = "polizas-rc-descarga";

export default function SinConexion() {
  const [estado, setEstado] = useState<"" | "trabajando" | "listo" | "error">("");
  const [avance, setAvance] = useState("");
  const [ultima, setUltima] = useState<string | null>(() => {
    try { return typeof window === "undefined" ? null : localStorage.getItem(KEY); } catch { return null; }
  });

  async function descargar() {
    if (!navigator.onLine) { setEstado("error"); setAvance("Necesitas conexión para descargar."); return; }
    setEstado("trabajando");
    try {
      setAvance("Guardando datos…");
      const [asegurados, polizas] = await Promise.all([listarAsegurados(), listarPolizas(), getDiasAviso()]);

      setAvance("Guardando pantallas…");
      const rutas = ["/", "/polizas", "/asegurados", "/asegurados/nuevo", "/graficas", "/configuracion", "/acerca",
        ...polizas.map((p) => `/polizas/${p.id}`), ...asegurados.map((a) => `/asegurados/${a.id}`)];
      const estaticos = new Set<string>();
      for (const r of rutas) {
        const html = await fetch(r).then((x) => x.text()).catch(() => "");
        for (const m of html.matchAll(/\/_next\/static\/[^"'\s)]+/g)) estaticos.add(m[0].replace(/\\u0026/g, "&"));
      }
      await Promise.all([...estaticos].map((u) => fetch(u).catch(() => null)));

      const docs = (await listarTodosDocumentos()).filter((d) => d.url);
      const cache = await caches.open("rc-pdfs");
      let n = 0;
      for (const d of docs) {
        setAvance(`Guardando documentos ${++n} de ${docs.length}…`);
        if (!(await cache.match(d.url!))) {
          const res = await fetch(d.url!);
          if (res.ok) await cache.put(d.url!, res);
        }
      }
      const ahora = new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City", dateStyle: "medium", timeStyle: "short" });
      try { localStorage.setItem(KEY, ahora); } catch {}
      setUltima(ahora);
      setAvance(`Listo: ${polizas.length} pólizas, ${asegurados.length} asegurados y ${docs.length} documentos disponibles sin conexión.`);
      setEstado("listo");
    } catch (e) {
      setAvance(`No se completó: ${(e as Error).message}`);
      setEstado("error");
    }
  }

  return (
    <section className="card space-y-3">
      <h2 className="flex items-center gap-2 font-semibold"><WifiOff size={18} /> Uso sin conexión</h2>
      <p className="text-sm text-muted">
        Los datos se guardan solos en este equipo. Con este botón también guardas todos los PDFs para verlos sin internet.
        Repítelo cuando agregues documentos nuevos.
      </p>
      {ultima && <p className="text-xs text-muted">Última descarga: {ultima}</p>}
      <button className="btn-primary" onClick={descargar} disabled={estado === "trabajando"}>
        <CloudDownload size={16} /> {estado === "trabajando" ? "Descargando…" : "Descargar todo para usar sin conexión"}
      </button>
      {avance && <p className={`text-sm ${estado === "error" ? "text-rose-600" : estado === "listo" ? "text-emerald-600" : "text-muted"}`}>{avance}</p>}
    </section>
  );
}
