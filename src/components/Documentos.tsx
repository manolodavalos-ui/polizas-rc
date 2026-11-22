"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { subirDocumentos } from "@/lib/subir";
import type { Documento } from "@/lib/polizas";

const TIPOS: Record<string, string> = { poliza: "Póliza", tarjeta: "Tarjeta médica", excel: "Excel", otro: "Otro" };

export default function Documentos({ docs, polizaId = null, aseguradoId = null, tipoDefault = "poliza" }: {
  docs: (Documento & { url: string | null })[];
  polizaId?: string | null;
  aseguradoId?: string | null;
  tipoDefault?: string;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [tipo, setTipo] = useState(tipoDefault);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      await subirDocumentos(createClient(), [...files].map((file) => ({ file, tipo })), { poliza_id: polizaId, asegurado_id: aseguradoId });
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function borrar(d: Documento) {
    if (!confirm(`¿Eliminar "${d.nombre}"?`)) return;
    const supabase = createClient();
    await supabase.storage.from("documentos").remove([d.storage_path]);
    await supabase.from("documentos").delete().eq("id", d.id);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {docs.length === 0 && <p className="text-sm text-muted">Sin documentos.</p>}
      <ul className="divide-y divide-line">
        {docs.map((d) => (
          <li key={d.id} className="flex items-center gap-3 py-2">
            <FileText size={18} className="shrink-0 text-brand" />
            <div className="min-w-0 flex-1">
              {d.url ? (
                <a href={d.url} target="_blank" rel="noreferrer" className="block truncate text-sm font-medium hover:text-brand">{d.nombre}</a>
              ) : (
                <span className="block truncate text-sm">{d.nombre}</span>
              )}
              <span className="text-xs text-muted">{TIPOS[d.tipo] ?? d.tipo}</span>
            </div>
            <button aria-label="Eliminar" className="rounded p-1.5 text-muted hover:text-rose-600" onClick={() => borrar(d)}>
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-2">
        <select className="input w-auto" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input ref={input} type="file" multiple accept=".pdf,.xlsx,.xls,.csv,image/*" className="hidden" onChange={(e) => onFiles(e.target.files)} />
        <button className="btn-ghost" disabled={busy} onClick={() => input.current?.click()}>
          <Upload size={16} /> {busy ? "Subiendo…" : "Subir archivo"}
        </button>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
