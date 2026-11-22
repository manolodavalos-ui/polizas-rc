import { createClient } from "@/lib/supabase/server";
import { getDiasAviso } from "@/lib/config";
import { ESTADO_INFO, estadoPoliza, fmtMoneda, hoyISO, type Poliza } from "@/lib/polizas";
import Graficas, { type Serie } from "@/components/Graficas";

export const dynamic = "force-dynamic";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function agrupar(polizas: Poliza[], key: (p: Poliza) => string, val: (p: Poliza) => number = () => 1): Serie {
  const m = new Map<string, number>();
  polizas.forEach((p) => m.set(key(p), (m.get(key(p)) ?? 0) + val(p)));
  return [...m.entries()].map(([nombre, valor]) => ({ nombre, valor: Math.round(valor * 100) / 100 })).sort((a, b) => b.valor - a.valor);
}

export default async function GraficasPage() {
  const supabase = await createClient();
  const diasAviso = await getDiasAviso();
  const { data } = await supabase.from("polizas").select("*");
  const polizas = (data ?? []) as Poliza[];

  const [hy, hm] = hoyISO().split("-").map(Number);
  const vencimientos: Serie = Array.from({ length: 12 }, (_, i) => {
    const y = hy + Math.floor((hm - 1 + i) / 12);
    const m = ((hm - 1 + i) % 12) + 1;
    const pref = `${y}-${String(m).padStart(2, "0")}`;
    return { nombre: `${MESES[m - 1]} ${String(y).slice(2)}`, valor: polizas.filter((p) => p.fin_vigencia.startsWith(pref)).length };
  });

  const estados = Object.entries(ESTADO_INFO).map(([k, v]) => ({
    nombre: v.label,
    valor: polizas.filter((p) => estadoPoliza(p.fin_vigencia, diasAviso) === k).length,
  }));

  const primaTotal = polizas.reduce((s, p) => s + (p.prima ?? 0), 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Gráficas y análisis</h1>
        <p className="text-sm text-muted">{polizas.length} pólizas · prima total {fmtMoneda(primaTotal)}</p>
      </div>
      <Graficas
        bloques={[
          { titulo: "Pólizas por ramo", datos: agrupar(polizas, (p) => p.ramo), tipo: "conteo" },
          { titulo: "Prima por ramo", datos: agrupar(polizas, (p) => p.ramo, (p) => p.prima ?? 0), tipo: "moneda" },
          { titulo: "Vencimientos próximos 12 meses", datos: vencimientos, tipo: "conteo", vertical: true },
          { titulo: "Pólizas por aseguradora", datos: agrupar(polizas, (p) => p.aseguradora), tipo: "conteo" },
          { titulo: "Pólizas por estado", datos: estados, tipo: "conteo" },
        ]}
      />
    </div>
  );
}
