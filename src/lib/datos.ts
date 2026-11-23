"use client";
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocFromCache, getDocFromServer, getDocs, getDocsFromCache, getDocsFromServer,
  orderBy, query, serverTimestamp, setDoc, updateDoc, where, writeBatch,
  type DocumentReference, type DocumentSnapshot, type Query, type QuerySnapshot,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "./firebase";
import { rutaArchivo, type Asegurado, type Documento, type Poliza } from "./polizas";

type ConId<T> = T & { id: string };
const conId = <T,>(d: { id: string; data: () => unknown }) => ({ id: d.id, ...(d.data() as T) }) as ConId<T>;

// ---------- Lectura rápida: primero la copia local, luego se actualiza desde la nube ----------
const ultimaConsulta = new Map<string, number>();
const huellaDocs = (s: QuerySnapshot) => s.docs.map((d) => d.id + JSON.stringify(d.data())).join("|");
const huellaDoc = (s: DocumentSnapshot) => (s.exists() ? JSON.stringify(s.data()) : "-");
function avisarCambio() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("rc:datos"));
}
function refrescar(clave: string, tarea: () => Promise<boolean>) {
  const t = ultimaConsulta.get(clave) ?? 0;
  if (Date.now() - t < 30_000) return;
  ultimaConsulta.set(clave, Date.now());
  tarea().then((cambio) => cambio && avisarCambio()).catch(() => ultimaConsulta.delete(clave));
}

async function leerDocs(q: Query, clave: string): Promise<QuerySnapshot> {
  const local = await getDocsFromCache(q).catch(() => null);
  if (local && !local.empty) {
    refrescar(clave, async () => huellaDocs(await getDocsFromServer(q)) !== huellaDocs(local));
    return local;
  }
  ultimaConsulta.set(clave, Date.now());
  return getDocs(q);
}

async function leerDoc(r: DocumentReference, clave: string): Promise<DocumentSnapshot> {
  const local = await getDocFromCache(r).catch(() => null);
  if (local && local.exists()) {
    refrescar(clave, async () => huellaDoc(await getDocFromServer(r)) !== huellaDoc(local));
    return local;
  }
  ultimaConsulta.set(clave, Date.now());
  return getDoc(r);
}

// ---------- Configuración ----------
export async function getDiasAviso(): Promise<number> {
  const s = await leerDoc(doc(db, "config", "general"), "config");
  const n = Number(s.data()?.dias_aviso);
  return Number.isFinite(n) && n > 0 ? n : 30;
}
export const setDiasAviso = (n: number) => setDoc(doc(db, "config", "general"), { dias_aviso: n }, { merge: true });

// ---------- Asegurados ----------
export async function listarAsegurados(): Promise<Asegurado[]> {
  const s = await leerDocs(query(collection(db, "asegurados"), orderBy("nombre")), "asegurados");
  return s.docs.map((d) => conId<Omit<Asegurado, "id">>(d));
}
export async function getAsegurado(id: string): Promise<Asegurado | null> {
  const s = await leerDoc(doc(db, "asegurados", id), `asegurado/${id}`);
  return s.exists() ? conId<Omit<Asegurado, "id">>(s) : null;
}
export async function crearAsegurado(a: Omit<Asegurado, "id">): Promise<string> {
  const r = await addDoc(collection(db, "asegurados"), { ...a, created_at: serverTimestamp() });
  return r.id;
}
export async function actualizarAsegurado(id: string, a: Omit<Asegurado, "id">) {
  await updateDoc(doc(db, "asegurados", id), a);
  // Mantener el nombre copiado en sus pólizas
  const pols = await getDocs(query(collection(db, "polizas"), where("asegurado_id", "==", id)));
  const b = writeBatch(db);
  pols.docs.forEach((p) => b.update(p.ref, { asegurado_nombre: a.nombre }));
  await b.commit();
}
export async function eliminarAsegurado(id: string) {
  const pols = await getDocs(query(collection(db, "polizas"), where("asegurado_id", "==", id)));
  for (const p of pols.docs) await eliminarPoliza(p.id);
  const docs = await getDocs(query(collection(db, "documentos"), where("asegurado_id", "==", id)));
  for (const d of docs.docs) await eliminarDocumento(conId<Omit<Documento, "id">>(d));
  await deleteDoc(doc(db, "asegurados", id));
}

// ---------- Pólizas ----------
export async function listarPolizas(aseguradoId?: string): Promise<Poliza[]> {
  const q = aseguradoId
    ? query(collection(db, "polizas"), where("asegurado_id", "==", aseguradoId))
    : query(collection(db, "polizas"));
  const s = await leerDocs(q, `polizas/${aseguradoId ?? "*"}`);
  return s.docs.map((d) => conId<Omit<Poliza, "id">>(d)).sort((a, b) => a.fin_vigencia.localeCompare(b.fin_vigencia));
}
export async function getPoliza(id: string): Promise<Poliza | null> {
  const s = await leerDoc(doc(db, "polizas", id), `poliza/${id}`);
  return s.exists() ? conId<Omit<Poliza, "id">>(s) : null;
}
export async function crearPoliza(p: Omit<Poliza, "id">): Promise<string> {
  const r = await addDoc(collection(db, "polizas"), { ...p, created_at: serverTimestamp() });
  return r.id;
}
export const actualizarPoliza = (id: string, p: Partial<Poliza>) => updateDoc(doc(db, "polizas", id), p);
export async function eliminarPoliza(id: string) {
  const docs = await getDocs(query(collection(db, "documentos"), where("poliza_id", "==", id)));
  for (const d of docs.docs) await eliminarDocumento(conId<Omit<Documento, "id">>(d));
  await deleteDoc(doc(db, "polizas", id));
}

// ---------- Documentos ----------
export type DocConUrl = Documento & { url: string | null };

export async function listarDocumentos(filtro: { poliza_id?: string; asegurado_id?: string; generales?: boolean }): Promise<DocConUrl[]> {
  let q;
  if (filtro.poliza_id) q = query(collection(db, "documentos"), where("poliza_id", "==", filtro.poliza_id));
  else if (filtro.asegurado_id) q = query(collection(db, "documentos"), where("asegurado_id", "==", filtro.asegurado_id), where("poliza_id", "==", null));
  else q = query(collection(db, "documentos"), where("asegurado_id", "==", null), where("poliza_id", "==", null));
  const s = await leerDocs(q, `documentos/${JSON.stringify(filtro)}`);
  const docs = s.docs.map((d) => conId<Omit<Documento, "id">>(d)).sort((a, b) => a.nombre.localeCompare(b.nombre));
  return Promise.all(docs.map(async (d) => ({ ...d, url: await urlArchivo(d.storage_path) })));
}

// Recuerda los enlaces de descarga para poder abrir PDFs guardados sin conexión.
const URLS_KEY = "polizas-rc-urls";
function leerUrls(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(URLS_KEY) ?? "{}"); } catch { return {}; }
}
export async function urlArchivo(path: string): Promise<string | null> {
  const guardada = typeof window !== "undefined" ? leerUrls()[path] : undefined;
  if (guardada) return guardada; // los enlaces de descarga no cambian
  try {
    const url = await getDownloadURL(ref(storage, path));
    try { const m = leerUrls(); if (m[path] !== url) { m[path] = url; localStorage.setItem(URLS_KEY, JSON.stringify(m)); } } catch {}
    return url;
  } catch {
    return leerUrls()[path] ?? null;
  }
}

/** Todos los documentos (para descargarlos y usarlos sin conexión). */
export async function listarTodosDocumentos(): Promise<DocConUrl[]> {
  const s = await getDocs(collection(db, "documentos"));
  const docs = s.docs.map((d) => conId<Omit<Documento, "id">>(d));
  return Promise.all(docs.map(async (d) => ({ ...d, url: await urlArchivo(d.storage_path) })));
}

/** Sube archivos a Storage y registra cada uno en la colección documentos. */
export async function subirDocumentos(archivos: { file: File; tipo: string }[], r: { poliza_id?: string | null; asegurado_id?: string | null }) {
  const poliza_id = r.poliza_id ?? null;
  const asegurado_id = r.asegurado_id ?? null;
  for (const { file, tipo } of archivos) {
    const carpeta = poliza_id ? `polizas/${poliza_id}` : asegurado_id ? `asegurados/${asegurado_id}` : "generales";
    const path = rutaArchivo(carpeta, file.name);
    await uploadBytes(ref(storage, path), file, { contentType: file.type || undefined });
    await addDoc(collection(db, "documentos"), { poliza_id, asegurado_id, tipo, nombre: file.name, storage_path: path, created_at: serverTimestamp() });
  }
}

export async function eliminarDocumento(d: Pick<Documento, "id" | "storage_path">) {
  await deleteObject(ref(storage, d.storage_path)).catch(() => undefined);
  await deleteDoc(doc(db, "documentos", d.id));
}
