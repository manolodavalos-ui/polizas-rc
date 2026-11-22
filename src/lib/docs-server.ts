import type { SupabaseClient } from "@supabase/supabase-js";
import type { Documento } from "./polizas";

/** Agrega una URL firmada (1 hora) a cada documento. */
export async function conUrls(supabase: SupabaseClient, docs: Documento[]) {
  if (docs.length === 0) return [];
  const { data } = await supabase.storage.from("documentos").createSignedUrls(docs.map((d) => d.storage_path), 3600);
  return docs.map((d, i) => ({ ...d, url: data?.[i]?.signedUrl ?? null }));
}
