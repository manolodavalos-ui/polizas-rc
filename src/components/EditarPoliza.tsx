"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Poliza } from "@/lib/polizas";
import PolizaCamposForm, { limpiarPoliza, type PolizaCampos } from "./PolizaForm";

export default function EditarPoliza({ poliza }: { poliza: Poliza }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState<PolizaCampos>({
    ramo: poliza.ramo, aseguradora: poliza.aseguradora, numero_poliza: poliza.numero_poliza, certificado: poliza.certificado,
    inicio_vigencia: poliza.inicio_vigencia, fin_vigencia: poliza.fin_vigencia, prima: poliza.prima, moneda: poliza.moneda, notas: poliza.notas,
  });
  const [error, setError] = useState("");

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await createClient().from("polizas").update(limpiarPoliza(v)).eq("id", poliza.id);
    if (error) return setError(error.message);
    setOpen(false);
    router.refresh();
  }

  async function eliminar() {
    if (!confirm("¿Eliminar esta póliza y sus documentos?")) return;
    const supabase = createClient();
    const { data: docs } = await supabase.from("documentos").select("storage_path").eq("poliza_id", poliza.id);
    if (docs?.length) await supabase.storage.from("documentos").remove(docs.map((d) => d.storage_path));
    await supabase.from("polizas").delete().eq("id", poliza.id);
    router.replace(`/asegurados/${poliza.asegurado_id}`);
    router.refresh();
  }

  if (!open) return <button className="btn-ghost px-3 py-1.5" onClick={() => setOpen(true)}><Pencil size={14} /> Editar</button>;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <form onSubmit={guardar} className="card max-h-[90dvh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-b-none sm:rounded-xl">
        <h2 className="text-lg font-semibold">Editar póliza</h2>
        <PolizaCamposForm value={v} onChange={setV} />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <div className="flex flex-wrap justify-between gap-2">
          <button type="button" className="btn-ghost text-rose-600" onClick={eliminar}><Trash2 size={16} /> Eliminar</button>
          <div className="flex gap-2">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn-primary">Guardar</button>
          </div>
        </div>
      </form>
    </div>
  );
}
