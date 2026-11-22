import { createClient } from "@/lib/supabase/server";
import NuevoForm from "@/components/NuevoForm";

export const dynamic = "force-dynamic";

export default async function NuevoPage({ searchParams }: { searchParams: Promise<{ asegurado?: string }> }) {
  const { asegurado } = await searchParams;
  let existente: { id: string; nombre: string } | null = null;
  if (asegurado) {
    const supabase = await createClient();
    const { data } = await supabase.from("asegurados").select("id, nombre").eq("id", asegurado).maybeSingle();
    existente = data;
  }
  return <NuevoForm existente={existente} />;
}
