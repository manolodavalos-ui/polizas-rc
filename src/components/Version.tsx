"use client";
import { useState } from "react";
import { History, RefreshCw } from "lucide-react";
import { CAMBIOS } from "@/lib/cambios";

const VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? CAMBIOS[0].version;
const BUILD = process.env.NEXT_PUBLIC_BUILD_ID ?? "";

function fecha(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-MX", { timeZone: "America/Mexico_City", dateStyle: "medium", timeStyle: "short" });
}

async function recargar() {
  try {
    // Conserva los PDFs guardados para uso sin conexión
    if ("caches" in window) for (const k of await caches.keys()) if (k !== "rc-pdfs") await caches.delete(k);
    if ("serviceWorker" in navigator) for (const r of await navigator.serviceWorker.getRegistrations()) await r.update();
  } catch {}
  window.location.reload();
}

export default function Version() {
  const [estado, setEstado] = useState<"" | "buscando" | "nueva" | "al-dia" | "error">("");
  const [historial, setHistorial] = useState(false);
  const [remota, setRemota] = useState<{ version?: string; build?: string }>({});

  async function buscar() {
    setEstado("buscando");
    try {
      const r = await fetch(`/api/version?t=${Date.now()}`, { cache: "no-store" });
      const v = await r.json();
      setRemota(v);
      setEstado(v.build && v.build !== BUILD ? "nueva" : "al-dia");
    } catch {
      setEstado("error");
    }
  }

  return (
    <section className="card space-y-3">
      <h2 className="font-semibold">Versión de la app</h2>
      <p className="text-sm">
        Versión <b>{VERSION}</b> · publicada {fecha(BUILD)}
      </p>
      {estado === "al-dia" && <p className="text-sm text-emerald-600">Ya tienes la versión más reciente.</p>}
      {estado === "error" && <p className="text-sm text-rose-600">No se pudo comprobar. Revisa tu conexión.</p>}
      {estado === "nueva" ? (
        <div className="space-y-2">
          <p className="text-sm text-amber-600">
            Hay una nueva versión ({remota.version}, publicada {fecha(remota.build ?? "")}).
          </p>
          <button className="btn-primary" onClick={recargar}><RefreshCw size={16} /> Actualizar ahora</button>
        </div>
      ) : (
        <button className="btn-ghost" onClick={buscar} disabled={estado === "buscando"}>
          <RefreshCw size={16} className={estado === "buscando" ? "animate-spin" : ""} />
          {estado === "buscando" ? "Buscando…" : "Buscar actualización"}
        </button>
      )}
      <div className="border-t border-line pt-3">
        <button className="btn-ghost" onClick={() => setHistorial(!historial)}>
          <History size={16} /> {historial ? "Ocultar historial" : "Ver historial de versiones"}
        </button>
        {historial && (
          <ol className="mt-3 space-y-3">
            {CAMBIOS.map((c) => (
              <li key={c.version} className="text-sm">
                <div className="font-medium">
                  v{c.version} <span className="font-normal text-muted">· {c.fecha.split("-").reverse().join("/")}</span>
                  {c.version === VERSION && <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">actual</span>}
                </div>
                <ul className="ml-4 list-disc text-muted">
                  {c.cambios.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
