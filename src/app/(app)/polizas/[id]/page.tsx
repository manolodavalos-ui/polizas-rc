import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDiasAviso } from "@/lib/config";
import { conUrls } from "@/lib/docs-server";
import { diasRestantes, estadoPoliza, fmtFecha, fmtMoneda, type Documento, type Poliza } from "@/lib/polizas";
import EstadoBadge from "@/components/EstadoBadge";
import Documentos from "@/components/Documentos";
import EditarPoliza from "@/components/EditarPoliza";

export const dynamic = "force-dynamic";

export default async function PolizaDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase.from("polizas").select("*, asegurados(nombre)").eq("id", id).maybeSingle<Poliza>();
  if (!p) notFound();
  const diasAviso = await getDiasAviso();
  const { data: docs } = await supabase.from("documentos").select("*").eq("poliza_id", id).order("created_at");
  const docsUrl = await conUrls(supabase, (docs ?? []) as Documento[]);
  const d = diasRestantes(p.fin_vigencia);

  const datos: [string, string][] = [
    ["Ramo", p.ramo],
    ["Aseguradora", p.aseguradora],
    ["Número de póliza", p.numero_poliza],
    ["Certificado", p.certificado ?? "—"],
    ["Inicio de vigencia", fmtFecha(p.inicio_vigencia)],
    ["Fin de vigencia", `${fmtFecha(p.fin_vigencia)} (${d < 0 ? `venció hace ${-d}` : `faltan ${d}`} días)`],
    ["Prima", fmtMoneda(p.prima, p.moneda)],
    ["Notas", p.notas ?? "—"],
  ];

  return (
    <div className="space-y-4">
      <Link href="/polizas" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><ArrowLeft size={16} /> Pólizas</Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{p.ramo} · {p.numero_poliza}</h1>
          <Link href={`/asegurados/${p.asegurado_id}`} className="text-sm text-brand hover:underline">{p.asegurados?.nombre}</Link>
        </div>
        <EstadoBadge estado={estadoPoliza(p.fin_vigencia, diasAviso)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Datos</h2>
            <EditarPoliza poliza={p} />
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {datos.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted">{k}</dt>
                <dd className="break-words">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="card">
          <h2 className="mb-3 font-semibold">Documentos</h2>
          <Documentos docs={docsUrl} polizaId={p.id} />
        </section>
      </div>
    </div>
  );
}
