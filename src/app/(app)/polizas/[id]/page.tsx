"use client";
import Link from "next/link";
import { use } from "react";
import { ArrowLeft } from "lucide-react";
import { getDiasAviso, getPoliza, listarDocumentos } from "@/lib/datos";
import { useCarga } from "@/lib/useCarga";
import { diasRestantes, estadoPoliza, fmtFecha, fmtMoneda } from "@/lib/polizas";
import EstadoBadge from "@/components/EstadoBadge";
import Documentos from "@/components/Documentos";
import EditarPoliza from "@/components/EditarPoliza";
import Cargando from "@/components/Cargando";

export default function PolizaDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, recargar } = useCarga(() => Promise.all([getPoliza(id), getDiasAviso(), listarDocumentos({ poliza_id: id })]), [id]);
  if (!data) return <Cargando error={error} />;
  const [p, diasAviso, docs] = data;
  if (!p) return <p className="card text-sm">Esta póliza no existe. <Link className="text-brand" href="/polizas">Volver</Link></p>;
  const d = diasRestantes(p.fin_vigencia);

  const datos: [string, string][] = [
    ["Ramo", p.ramo],
    ["Aseguradora", p.aseguradora],
    ["Número de póliza", p.numero_poliza],
    ["Certificado", p.certificado || "—"],
    ["Inicio de vigencia", fmtFecha(p.inicio_vigencia)],
    ["Fin de vigencia", `${fmtFecha(p.fin_vigencia)} (${d < 0 ? `venció hace ${-d}` : `faltan ${d}`} días)`],
    ["Prima", fmtMoneda(p.prima, p.moneda)],
    ["Notas", p.notas || "—"],
  ];

  return (
    <div className="space-y-4">
      <Link href="/polizas" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><ArrowLeft size={16} /> Pólizas</Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{p.ramo} · {p.numero_poliza}</h1>
          <Link href={`/asegurados/${p.asegurado_id}`} className="text-sm text-brand hover:underline">{p.asegurado_nombre}</Link>
        </div>
        <EstadoBadge estado={estadoPoliza(p.fin_vigencia, diasAviso)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Datos</h2>
            <EditarPoliza poliza={p} onGuardado={recargar} />
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
          <Documentos docs={docs} polizaId={p.id} aseguradoId={p.asegurado_id} onCambio={recargar} />
        </section>
      </div>
    </div>
  );
}
