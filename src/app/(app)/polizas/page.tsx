"use client";
import { use } from "react";
import { getDiasAviso, listarPolizas } from "@/lib/datos";
import { useCarga } from "@/lib/useCarga";
import { estadoPoliza } from "@/lib/polizas";
import TablaPolizas from "@/components/TablaPolizas";
import Cargando from "@/components/Cargando";

export default function PolizasPage({ searchParams }: { searchParams: Promise<{ estado?: string; ramo?: string }> }) {
  const sp = use(searchParams);
  const { data, error } = useCarga(() => Promise.all([listarPolizas(), getDiasAviso()]));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Pólizas</h1>
      {data ? (
        <TablaPolizas
          filas={data[0].map((p) => ({ ...p, estado: estadoPoliza(p.fin_vigencia, data[1]) }))}
          estadoInicial={sp.estado ?? ""}
          ramoInicial={sp.ramo ?? ""}
        />
      ) : (
        <Cargando error={error} />
      )}
    </div>
  );
}
