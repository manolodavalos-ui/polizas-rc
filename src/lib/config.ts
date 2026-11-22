import { createClient } from "@/lib/supabase/server";

export async function getDiasAviso(): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase.from("configuracion").select("valor").eq("clave", "dias_aviso").maybeSingle();
  const n = Number(data?.valor);
  return Number.isFinite(n) && n > 0 ? n : 30;
}
