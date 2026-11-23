"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getDiasAviso, listarPolizas } from "@/lib/datos";
import { useCarga } from "@/lib/useCarga";
import { estadoPoliza } from "@/lib/polizas";
import TablaPolizas from "@/components/TablaPolizas";
import Cargando from "@/components/Cargando";

function Contenido() {
  const sp = useSearchParams();
  const estado = sp.get("estado") ?? "";
  const ramo = sp.get("ramo") ?? "";
  const { data, error } = useCarga(() => Promise.all([listarPolizas(), getDiasAviso()]));
  if (!data) return <Cargando error={error} />;
  return (
    <TablaPolizas
      key={`${estado}|${ramo}`}
      filas={data[0].map((p) => ({ ...p, estado: estadoPoliza(p.fin_vigencia, data[1]) }))}
      estadoInicial={estado}
      ramoInicial={ramo}
    />
  );
}

export default function PolizasPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Pólizas</h1>
      <Suspense fallback={<Cargando />}>
        <Contenido />
      </Suspense>
    </div>
  );
}
