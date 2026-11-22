"use client";
import Link from "next/link";
import { use } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { getAsegurado, getDiasAviso, listarDocumentos, listarPolizas } from "@/lib/datos";
import { useCarga } from "@/lib/useCarga";
import { edad, estadoPoliza, fmtFecha } from "@/lib/polizas";
import TablaPolizas from "@/components/TablaPolizas";
import Documentos from "@/components/Documentos";
import EditarAsegurado from "@/components/EditarAsegurado";
import Cargando from "@/components/Cargando";

export default function AseguradoDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, recargar } = useCarga(
    () => Promise.all([getAsegurado(id), listarPolizas(id), getDiasAviso(), listarDocumentos({ asegurado_id: id })]),
    [id],
  );
  if (!data) return <Cargando error={error} />;
  const [a, pol, diasAviso, docs] = data;
  if (!a) return <p className="card text-sm">Este asegurado no existe. <Link className="text-brand" href="/asegurados">Volver</Link></p>;
  const filas = pol.map((p) => ({ ...p, estado: estadoPoliza(p.fin_vigencia, diasAviso) }));
  const e = edad(a.fecha_nacimiento);

  return (
    <div className="space-y-4">
      <Link href="/asegurados" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><ArrowLeft size={16} /> Asegurados</Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{a.nombre}</h1>
          <p className="text-sm text-muted">
            {a.fecha_nacimiento ? `Nacimiento ${fmtFecha(a.fecha_nacimiento)} · ${e} años` : "Sin fecha de nacimiento"}
            {a.email ? ` · ${a.email}` : ""}{a.telefono ? ` · ${a.telefono}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <EditarAsegurado asegurado={a} onGuardado={recargar} />
          <Link href={`/asegurados/nuevo?asegurado=${a.id}`} className="btn-primary"><Plus size={16} /> Agregar póliza</Link>
        </div>
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold">Pólizas</h2>
        <TablaPolizas filas={filas} ocultarAsegurado />
      </section>

      <section className="card">
        <h2 className="mb-3 font-semibold">Otros documentos del asegurado</h2>
        <Documentos docs={docs} aseguradoId={a.id} tipoDefault="otro" onCambio={recargar} />
      </section>
    </div>
  );
}
