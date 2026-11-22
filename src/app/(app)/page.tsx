import Link from "next/link";
import { AlertTriangle, CheckCircle2, UserPlus, Users, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDiasAviso } from "@/lib/config";
import { diasRestantes, estadoPoliza, fmtFecha, type Poliza } from "@/lib/polizas";
import EstadoBadge from "@/components/EstadoBadge";

export const dynamic = "force-dynamic";

export default async function Tablero() {
  const supabase = await createClient();
  const diasAviso = await getDiasAviso();
  const { data } = await supabase
    .from("polizas")
    .select("*, asegurados(nombre)")
    .order("fin_vigencia");
  const polizas = (data ?? []) as Poliza[];

  const conEstado = polizas.map((p) => ({ ...p, estado: estadoPoliza(p.fin_vigencia, diasAviso) }));
  const cuenta = { vigente: 0, por_vencer: 0, vencida: 0 };
  conEstado.forEach((p) => cuenta[p.estado]++);

  const porRamo = new Map<string, number>();
  polizas.forEach((p) => porRamo.set(p.ramo, (porRamo.get(p.ramo) ?? 0) + 1));
  const ramos = [...porRamo.entries()].sort((a, b) => b[1] - a[1]);
  const maxRamo = Math.max(1, ...ramos.map((r) => r[1]));

  const atencion = conEstado.filter((p) => p.estado !== "vigente").slice(0, 10);

  const kpis = [
    { key: "vigente", label: "Vigentes", value: cuenta.vigente, icon: CheckCircle2, color: "text-emerald-600" },
    { key: "por_vencer", label: `Próximas a vencer (${diasAviso} días)`, value: cuenta.por_vencer, icon: AlertTriangle, color: "text-amber-600" },
    { key: "vencida", label: "Vencidas", value: cuenta.vencida, icon: XCircle, color: "text-rose-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Tablero</h1>
          <p className="text-sm text-muted">{polizas.length} pólizas registradas</p>
        </div>
        <div className="flex gap-2">
          <Link href="/asegurados" className="btn-ghost"><Users size={16} /> Ver asegurados</Link>
          <Link href="/asegurados/nuevo" className="btn-primary"><UserPlus size={16} /> Nuevo asegurado</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {kpis.map(({ key, label, value, icon: Icon, color }) => (
          <Link key={key} href={`/polizas?estado=${key}`} className="card flex items-center gap-4 transition hover:border-brand/50">
            <Icon className={color} size={32} />
            <div>
              <div className="text-3xl font-semibold tabular-nums">{value}</div>
              <div className="text-sm text-muted">{label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card">
          <h2 className="mb-4 font-semibold">Pólizas por ramo</h2>
          {ramos.length === 0 && <p className="text-sm text-muted">Sin pólizas todavía.</p>}
          <ul className="space-y-3">
            {ramos.map(([ramo, n]) => (
              <li key={ramo}>
                <Link href={`/polizas?ramo=${encodeURIComponent(ramo)}`} className="block">
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{ramo}</span>
                    <span className="font-medium tabular-nums">{n}</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/5 dark:bg-white/10">
                    <div className="h-2 rounded-full bg-brand" style={{ width: `${(n / maxRamo) * 100}%` }} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 className="mb-4 font-semibold">Requieren atención</h2>
          {atencion.length === 0 && <p className="text-sm text-muted">Todo al día. No hay pólizas por vencer.</p>}
          <ul className="divide-y divide-line">
            {atencion.map((p) => {
              const d = diasRestantes(p.fin_vigencia);
              return (
                <li key={p.id}>
                  <Link href={`/polizas/${p.id}`} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{p.asegurados?.nombre}</div>
                      <div className="truncate text-xs text-muted">
                        {p.ramo} · {p.aseguradora} · vence {fmtFecha(p.fin_vigencia)} ({d < 0 ? `hace ${-d}` : `en ${d}`} días)
                      </div>
                    </div>
                    <EstadoBadge estado={p.estado} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
