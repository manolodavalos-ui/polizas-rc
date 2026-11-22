export type Asegurado = {
  id: string;
  nombre: string;
  fecha_nacimiento: string | null;
  email: string | null;
  telefono: string | null;
  notas: string | null;
};

export type Poliza = {
  id: string;
  asegurado_id: string;
  ramo: string;
  aseguradora: string;
  numero_poliza: string;
  certificado: string | null;
  inicio_vigencia: string;
  fin_vigencia: string;
  prima: number | null;
  moneda: string;
  notas: string | null;
  asegurado_nombre: string;
};

export type Documento = {
  id: string;
  poliza_id: string | null;
  asegurado_id: string | null;
  tipo: string;
  nombre: string;
  storage_path: string;
};

export type Estado = "vigente" | "por_vencer" | "vencida";

export const RAMOS = ["Gastos Médicos Mayores", "Gastos Médicos Menores", "Vida", "Autos", "Daños", "Otro"];

export const ESTADO_INFO: Record<Estado, { label: string; className: string }> = {
  vigente: { label: "Vigente", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  por_vencer: { label: "Próxima a vencer", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  vencida: { label: "Vencida", className: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300" },
};

/** Fecha de hoy en México como YYYY-MM-DD */
export function hoyISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date());
}

export function diasRestantes(fin: string, hoy = hoyISO()): number {
  return Math.round((Date.parse(fin) - Date.parse(hoy)) / 86_400_000);
}

export function estadoPoliza(fin: string, diasAviso: number, hoy = hoyISO()): Estado {
  const d = diasRestantes(fin, hoy);
  if (d < 0) return "vencida";
  if (d <= diasAviso) return "por_vencer";
  return "vigente";
}

export function fmtFecha(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function fmtMoneda(n: number | null, moneda = "MXN"): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: moneda }).format(n);
}

export function edad(fechaNac: string | null): number | null {
  if (!fechaNac) return null;
  const [y, m, d] = fechaNac.split("-").map(Number);
  const [hy, hm, hd] = hoyISO().split("-").map(Number);
  return hy - y - (hm < m || (hm === m && hd < d) ? 1 : 0);
}

export function rutaArchivo(carpeta: string, nombre: string): string {
  const limpio = nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\-]+/g, "_");
  return `${carpeta}/${Date.now()}_${limpio}`;
}
