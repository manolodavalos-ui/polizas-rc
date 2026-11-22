import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDiasAviso } from "@/lib/config";
import { conUrls } from "@/lib/docs-server";
import { edad, estadoPoliza, fmtFecha, type Asegurado, type Documento, type Poliza } from "@/lib/polizas";
import TablaPolizas from "@/components/TablaPolizas";
import Documentos from "@/components/Documentos";
import EditarAsegurado from "@/components/EditarAsegurado";

export const dynamic = "force-dynamic";

export default async function AseguradoDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: a } = await supabase.from("asegurados").select("*").eq("id", id).maybeSingle<Asegurado>();
  if (!a) notFound();
  const diasAviso = await getDiasAviso();
  const [{ data: pol }, { data: docs }] = await Promise.all([
    supabase.from("polizas").select("*").eq("asegurado_id", id).order("fin_vigencia"),
    supabase.from("documentos").select("*").eq("asegurado_id", id).is("poliza_id", null).order("created_at"),
  ]);
  const filas = ((pol ?? []) as Poliza[]).map((p) => ({ ...p, estado: estadoPoliza(p.fin_vigencia, diasAviso) }));
  const docsUrl = await conUrls(supabase, (docs ?? []) as Documento[]);
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
          <EditarAsegurado asegurado={a} />
          <Link href={`/asegurados/nuevo?asegurado=${a.id}`} className="btn-primary"><Plus size={16} /> Agregar póliza</Link>
        </div>
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold">Pólizas</h2>
        <TablaPolizas filas={filas} ocultarAsegurado />
      </section>

      <section className="card">
        <h2 className="mb-3 font-semibold">Otros documentos del asegurado</h2>
        <Documentos docs={docsUrl} aseguradoId={a.id} tipoDefault="otro" />
      </section>
    </div>
  );
}
