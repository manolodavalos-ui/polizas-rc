"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Asegurado } from "@/lib/polizas";
import AseguradoCamposForm, { limpiarAsegurado, type AseguradoCampos } from "./AseguradoCampos";

export default function EditarAsegurado({ asegurado }: { asegurado: Asegurado }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState<AseguradoCampos>({
    nombre: asegurado.nombre, fecha_nacimiento: asegurado.fecha_nacimiento ?? "", email: asegurado.email ?? "",
    telefono: asegurado.telefono ?? "", notas: asegurado.notas ?? "",
  });
  const [error, setError] = useState("");

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await createClient().from("asegurados").update(limpiarAsegurado(v)).eq("id", asegurado.id);
    if (error) return setError(error.message);
    setOpen(false);
    router.refresh();
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar a ${asegurado.nombre} con todas sus pólizas y documentos?`)) return;
    const supabase = createClient();
    const { data: pols } = await supabase.from("polizas").select("id").eq("asegurado_id", asegurado.id);
    const ids = (pols ?? []).map((p) => p.id);
    const { data: docs } = await supabase.from("documentos").select("storage_path")
      .or([`asegurado_id.eq.${asegurado.id}`, ...(ids.length ? [`poliza_id.in.(${ids.join(",")})`] : [])].join(","));
    if (docs?.length) await supabase.storage.from("documentos").remove(docs.map((d) => d.storage_path));
    await supabase.from("asegurados").delete().eq("id", asegurado.id);
    router.replace("/asegurados");
    router.refresh();
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
