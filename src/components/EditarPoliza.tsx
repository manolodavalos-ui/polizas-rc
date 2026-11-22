"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { actualizarPoliza, eliminarPoliza } from "@/lib/datos";
import type { Poliza } from "@/lib/polizas";
import PolizaCamposForm, { limpiarPoliza, type PolizaCampos } from "./PolizaForm";

export default function EditarPoliza({ poliza, onGuardado }: { poliza: Poliza; onGuardado: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState<PolizaCampos>({
    ramo: poliza.ramo, aseguradora: poliza.aseguradora, numero_poliza: poliza.numero_poliza, certificado: poliza.certificado,
    inicio_vigencia: poliza.inicio_vigencia, fin_vigencia: poliza.fin_vigencia, prima: poliza.prima, moneda: poliza.moneda, notas: poliza.notas,
  });
  const [error, setError] = useState("");

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    try {
      await actualizarPoliza(poliza.id, limpiarPoliza(v));
      setOpen(false);
      onGuardado();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function eliminar() {
    if (!confirm("¿Eliminar esta póliza y sus documentos?")) return;
    await eliminarPoliza(poliza.id);
    router.replace(`/asegurados/${poliza.asegurado_id}`);
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
