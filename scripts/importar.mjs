// Importa la relación inicial (datos.json) y sube los PDFs a Supabase.
// Uso: node --env-file=.env.local scripts/importar.mjs <datos.json> <carpeta-del-zip> [excel.xlsx]
// Requiere SUPABASE_SERVICE_ROLE_KEY en .env.local (nunca la subas a git).
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const [datosPath, carpeta, excel] = process.argv.slice(2);
if (!datosPath || !carpeta) {
  console.error("Uso: node --env-file=.env.local scripts/importar.mjs <datos.json> <carpeta> [excel.xlsx]");
  process.exit(1);
}
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const limpio = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\-]+/g, "_");
const tipoMime = (f) => (f.toLowerCase().endsWith(".pdf") ? "application/pdf" : "application/octet-stream");

async function subir(local, destino, ref, tipo) {
  const buf = await readFile(local);
  const up = await supabase.storage.from("documentos").upload(destino, buf, { contentType: tipoMime(local), upsert: true });
  if (up.error) throw new Error(`${local}: ${up.error.message}`);
  const ins = await supabase.from("documentos").upsert({ ...ref, tipo, nombre: path.basename(local), storage_path: destino }, { onConflict: "storage_path" });
  if (ins.error) throw ins.error;
}

const datos = JSON.parse(await readFile(datosPath, "utf8"));
const ids = {};
for (const a of datos.asegurados) {
  const { data: existe } = await supabase.from("asegurados").select("id").eq("nombre", a.nombre).maybeSingle();
  if (existe) { ids[a.key] = existe.id; continue; }
  const { data, error } = await supabase.from("asegurados").insert({ nombre: a.nombre, fecha_nacimiento: a.fecha_nacimiento }).select("id").single();
  if (error) throw error;
  ids[a.key] = data.id;
}
console.log(`Asegurados: ${Object.keys(ids).length}`);

let nPol = 0, nDocs = 0;
for (const p of datos.polizas) {
  const asegurado_id = ids[p.asegurado];
  let q = supabase.from("polizas").select("id").eq("asegurado_id", asegurado_id).eq("numero_poliza", p.numero_poliza).eq("fin_vigencia", p.fin_vigencia);
  q = p.certificado ? q.eq("certificado", p.certificado) : q;
  let { data: pol } = await q.maybeSingle();
  if (!pol) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { documentos, asegurado, ...campos } = p;
    const r = await supabase.from("polizas").insert({ ...campos, asegurado_id }).select("id").single();
    if (r.error) throw r.error;
    pol = r.data;
    nPol++;
  }
  for (const d of p.documentos) {
    await subir(path.join(carpeta, d.ruta), `polizas/${pol.id}/${limpio(path.basename(d.ruta))}`, { poliza_id: pol.id, asegurado_id }, d.tipo);
    nDocs++;
  }
}
console.log(`Pólizas nuevas: ${nPol}, documentos subidos: ${nDocs}`);

if (excel) {
  await subir(excel, `generales/${limpio(path.basename(excel))}`, {}, "excel");
  console.log("Excel subido a Documentos generales.");
}
