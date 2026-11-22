"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { actualizarAsegurado, eliminarAsegurado } from "@/lib/datos";
import type { Asegurado } from "@/lib/polizas";
import AseguradoCamposForm, { limpiarAsegurado, type AseguradoCampos } from "./AseguradoCampos";

export default function EditarAsegurado({ asegurado, onGuardado }: { asegurado: Asegurado; onGuardado: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState<AseguradoCampos>({
    nombre: asegurado.nombre, fecha_nacimiento: asegurado.fecha_nacimiento ?? "", email: asegurado.email ?? "",
    telefono: asegurado.telefono ?? "", notas: asegurado.notas ?? "",
  });
  const [error, setError] = useState("");

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    try {
      await actualizarAsegurado(asegurado.id, limpiarAsegurado(v));
      setOpen(false);
      onGuardado();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar a ${asegurado.nombre} con todas sus pólizas y documentos?`)) return;
    await eliminarAsegurado(asegurado.id);
    router.replace("/asegurados");
  }

  if (!open) return <button className="btn-ghost" onClick={() => setOpen(true)}><Pencil size={16} /> Editar</button>;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
      <form onSubmit={guardar} className="card w-full max-w-xl space-y-4 rounded-b-none sm:rounded-xl">
        <h2 className="text-lg font-semibold">Editar asegurado</h2>
        <AseguradoCamposForm value={v} onChange={setV} />
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
