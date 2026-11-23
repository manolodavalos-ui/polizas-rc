"use client";
import { getDiasAviso, listarAsegurados, listarPolizas } from "@/lib/datos";
import { useCarga } from "@/lib/useCarga";
import { estadoPoliza } from "@/lib/polizas";
import ListaAsegurados from "@/components/ListaAsegurados";
import Cargando from "@/components/Cargando";

export default function AseguradosPage() {
  const { data, error } = useCarga(() => Promise.all([listarAsegurados(), listarPolizas(), getDiasAviso()]));
  if (!data) return <Cargando error={error} />;
  const [asegurados, polizas, diasAviso] = data;
  const filas = asegurados.map((a) => {
    const estados = polizas.filter((p) => p.asegurado_id === a.id).map((p) => estadoPoliza(p.fin_vigencia, diasAviso));
    return {
      id: a.id,
      nombre: a.nombre,
      fecha_nacimiento: a.fecha_nacimiento,
      total: estados.length,
      ramos: [...new Set(polizas.filter((p) => p.asegurado_id === a.id).map((p) => p.ramo))],
      porVencer: estados.filter((e) => e === "por_vencer").length,
      vencidas: estados.filter((e) => e === "vencida").length,
    };
  });
  return <ListaAsegurados filas={filas} />;
}
