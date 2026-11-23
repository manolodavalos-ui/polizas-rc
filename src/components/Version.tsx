"use client";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

const VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0";
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
    </section>
  );
}
