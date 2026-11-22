// Carga inicial: autoriza al usuario, importa datos.json y sube los PDFs a Firebase.
// Uso:
//   node scripts/importar.mjs <service-account.json> <correo-del-usuario> <datos.json> <carpeta-del-zip> [excel.xlsx]
// La llave de cuenta de servicio se descarga en Firebase > Configuración del proyecto > Cuentas de servicio.
// NUNCA la subas a git ni la compartas.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const [llave, correo, datosPath, carpeta, excel] = process.argv.slice(2);
if (!llave || !correo || !datosPath || !carpeta) {
  console.error("Uso: node scripts/importar.mjs <service-account.json> <correo> <datos.json> <carpeta> [excel.xlsx]");
  process.exit(1);
}
const sa = JSON.parse(await readFile(llave, "utf8"));
const bucketName = process.env.FIREBASE_STORAGE_BUCKET ?? `${sa.project_id}.firebasestorage.app`;
initializeApp({ credential: cert(sa), storageBucket: bucketName });
const db = getFirestore();
const bucket = getStorage().bucket();
const limpio = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\-]+/g, "_");

// 1. Autorizar al usuario principal
const user = await getAuth().getUserByEmail(correo);
await db.doc(`usuarios/${user.uid}`).set({ email: correo, rol: "admin" }, { merge: true });
console.log(`Usuario autorizado: ${correo}`);
await db.doc("config/general").set({ dias_aviso: 30 }, { merge: true });

async function subir(local, destino, ref, tipo) {
  await bucket.upload(local, { destination: destino, contentType: local.toLowerCase().endsWith(".pdf") ? "application/pdf" : undefined });
  const id = limpio(destino).slice(-140);
  await db.doc(`documentos/${id}`).set({
    poliza_id: ref.poliza_id ?? null, asegurado_id: ref.asegurado_id ?? null, tipo,
    nombre: path.basename(local), storage_path: destino, created_at: FieldValue.serverTimestamp(),
  });
}

// 2. Asegurados y pólizas (ids estables: correr el script dos veces no duplica)
const datos = JSON.parse(await readFile(datosPath, "utf8"));
const nombres = {};
for (const a of datos.asegurados) {
  const id = limpio(a.key);
  nombres[a.key] = { id, nombre: a.nombre };
  await db.doc(`asegurados/${id}`).set({ nombre: a.nombre, fecha_nacimiento: a.fecha_nacimiento, email: null, telefono: null, notas: null }, { merge: true });
}
console.log(`Asegurados: ${datos.asegurados.length}`);

let nDocs = 0;
for (const p of datos.polizas) {
  const a = nombres[p.asegurado];
  const id = limpio(`${a.id}_${p.numero_poliza}_${p.certificado ?? ""}_${p.fin_vigencia}`);
  const { documentos, asegurado, ...campos } = p; // eslint-disable-line @typescript-eslint/no-unused-vars
  await db.doc(`polizas/${id}`).set({ ...campos, moneda: "MXN", notas: null, asegurado_id: a.id, asegurado_nombre: a.nombre }, { merge: true });
  for (const d of documentos) {
    await subir(path.join(carpeta, d.ruta), `polizas/${id}/${limpio(path.basename(d.ruta))}`, { poliza_id: id, asegurado_id: a.id }, d.tipo);
    nDocs++;
  }
}
console.log(`Pólizas: ${datos.polizas.length}, documentos subidos: ${nDocs}`);

if (excel) {
  await subir(excel, `generales/${limpio(path.basename(excel))}`, {}, "excel");
  console.log("Excel subido a Documentos generales.");
}
