import type { SupabaseClient } from "@supabase/supabase-js";
import { rutaArchivo } from "./polizas";

/** Sube archivos al bucket "documentos" y registra cada uno en la tabla documentos. */
export async function subirDocumentos(
  supabase: SupabaseClient,
  archivos: { file: File; tipo: string }[],
  ref: { poliza_id?: string | null; asegurado_id?: string | null },
) {
  for (const { file, tipo } of archivos) {
    const carpeta = ref.poliza_id ? `polizas/${ref.poliza_id}` : ref.asegurado_id ? `asegurados/${ref.asegurado_id}` : "generales";
    const path = rutaArchivo(carpeta, file.name);
    const up = await supabase.storage.from("documentos").upload(path, file, { contentType: file.type || undefined });
    if (up.error) throw new Error(`No se pudo subir ${file.name}: ${up.error.message}`);
    const ins = await supabase.from("documentos").insert({ ...ref, tipo, nombre: file.name, storage_path: path });
    if (ins.error) throw new Error(ins.error.message);
  }
}
