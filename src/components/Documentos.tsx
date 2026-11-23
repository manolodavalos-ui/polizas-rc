"use client";
import { useRef, useState } from "react";
import { Eye, FileText, Plus, Share2, Trash2, Upload, X } from "lucide-react";
import { eliminarDocumento, subirDocumentos, type DocConUrl } from "@/lib/datos";

const TIPOS: Record<string, string> = { poliza: "Póliza", tarjeta: "Tarjeta médica", excel: "Excel", otro: "Otro" };

async function compartir(d: DocConUrl, avisar: (m: string) => void) {
  if (!d.url) return;
  try {
    // Intenta compartir el archivo (WhatsApp, correo, etc.)
    if (navigator.canShare) {
      try {
        const blob = await (await fetch(d.url)).blob();
        const file = new File([blob], d.nombre, { type: blob.type || "application/pdf" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: d.nombre });
          return;
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    // Si no se puede el archivo, comparte el enlace
    if (navigator.share) {
      await navigator.share({ title: d.nombre, url: d.url });
      return;
    }
    await navigator.clipboard.writeText(d.url);
    avisar("Enlace copiado. Pégalo donde quieras compartirlo.");
  } catch (e) {
    if ((e as Error).name !== "AbortError") avisar("No se pudo compartir.");
  }
}

// Sin conexión: abre el PDF guardado en el equipo
async function verSinConexion(e: React.MouseEvent, d: DocConUrl, avisar: (m: string) => void) {
  if (navigator.onLine || !d.url) return;
  e.preventDefault();
  const w = window.open("", "_blank");
  try {
    const res = await fetch(d.url);
    if (!res.ok) throw new Error();
    const url = URL.createObjectURL(await res.blob());
    if (w) w.location.href = url; else window.location.href = url;
  } catch {
    w?.close();
    avisar("Este documento no está guardado para verlo sin conexión.");
  }
}

export default function Documentos({ docs, polizaId = null, aseguradoId = null, tipoDefault = "poliza", onCambio }: {
  docs: DocConUrl[];
  polizaId?: string | null;
  aseguradoId?: string | null;
  tipoDefault?: string;
  onCambio: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [tipo, setTipo] = useState(tipoDefault);
  const [abierto, setAbierto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setMsg("");
    try {
      await subirDocumentos([...files].map((file) => ({ file, tipo })), { poliza_id: polizaId, asegurado_id: aseguradoId });
      setAbierto(false);
      onCambio();
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function borrar(d: DocConUrl) {
    if (!confirm(`¿Eliminar "${d.nombre}"?`)) return;
    await eliminarDocumento(d);
    onCambio();
  }

  return (
    <div className="space-y-4">
      {docs.length === 0 && <p className="text-sm text-muted">Sin documentos.</p>}
      <ul className="divide-y divide-line">
        {docs.map((d) => (
          <li key={d.id} className="flex items-center gap-2 py-2">
            <FileText size={18} className="shrink-0 text-brand" />
            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{d.nombre}</span>
              <span className="text-xs text-muted">{TIPOS[d.tipo] ?? d.tipo}</span>
            </div>
            {d.url && (
              <>
                <a href={d.url} target="_blank" rel="noreferrer" aria-label="Ver" title="Ver" onClick={(e) => verSinConexion(e, d, setMsg)} className="rounded p-1.5 text-muted hover:text-brand">
                  <Eye size={18} />
                </a>
                <button aria-label="Compartir" title="Compartir" className="rounded p-1.5 text-muted hover:text-brand" onClick={() => compartir(d, setMsg)}>
                  <Share2 size={18} />
                </button>
              </>
            )}
            <button aria-label="Eliminar" title="Eliminar" className="rounded p-1.5 text-muted hover:text-rose-600" onClick={() => borrar(d)}>
              <Trash2 size={18} />
            </button>
          </li>
        ))}
      </ul>

      <div className="border-t border-line pt-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Agregar más documentos</h3>
          {abierto ? (
            <button className="btn-ghost" onClick={() => setAbierto(false)}><X size={16} /> Cancelar</button>
          ) : (
            <button className="btn-ghost" onClick={() => setAbierto(true)}><Plus size={16} /> Agregar</button>
          )}
        </div>
        {abierto && (
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <div>
              <label className="label">Tipo de documento</label>
              <select className="input w-auto" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <input ref={input} type="file" multiple accept=".pdf,.xlsx,.xls,.csv,image/*" className="hidden" onChange={(e) => onFiles(e.target.files)} />
            <button className="btn-primary" disabled={busy} onClick={() => input.current?.click()}>
              <Upload size={16} /> {busy ? "Subiendo…" : "Subir archivo"}
            </button>
          </div>
        )}
      </div>
      {msg && <p className="text-sm text-muted">{msg}</p>}
    </div>
  );
}
