import { createClient } from "@/lib/supabase/server";
import { getDiasAviso } from "@/lib/config";
import { estadoPoliza, type Poliza } from "@/lib/polizas";
import TablaPolizas from "@/components/TablaPolizas";

export const dynamic = "force-dynamic";

export default async function PolizasPage({ searchParams }: { searchParams: Promise<{ estado?: string; ramo?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const diasAviso = await getDiasAviso();
  const { data } = await supabase.from("polizas").select("*, asegurados(nombre)").order("fin_vigencia");
  const filas = ((data ?? []) as Poliza[]).map((p) => ({ ...p, estado: estadoPoliza(p.fin_vigencia, diasAviso) }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Pólizas</h1>
      <TablaPolizas filas={filas} estadoInicial={sp.estado ?? ""} ramoInicial={sp.ramo ?? ""} />
    </div>
  );
}
