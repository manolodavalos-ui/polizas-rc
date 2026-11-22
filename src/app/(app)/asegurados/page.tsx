import { createClient } from "@/lib/supabase/server";
import { getDiasAviso } from "@/lib/config";
import { estadoPoliza, type Asegurado } from "@/lib/polizas";
import ListaAsegurados from "@/components/ListaAsegurados";

export const dynamic = "force-dynamic";

export default async function AseguradosPage() {
  const supabase = await createClient();
  const diasAviso = await getDiasAviso();
  const { data } = await supabase.from("asegurados").select("*, polizas(fin_vigencia)").order("nombre");
  const filas = ((data ?? []) as (Asegurado & { polizas: { fin_vigencia: string }[] })[]).map((a) => {
    const estados = a.polizas.map((p) => estadoPoliza(p.fin_vigencia, diasAviso));
    return {
      id: a.id,
      nombre: a.nombre,
      fecha_nacimiento: a.fecha_nacimiento,
      total: a.polizas.length,
      porVencer: estados.filter((e) => e === "por_vencer").length,
      vencidas: estados.filter((e) => e === "vencida").length,
    };
  });
  return <ListaAsegurados filas={filas} />;
}
