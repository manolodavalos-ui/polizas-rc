"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AlertTriangle, CheckCircle2, FileText, LogOut, UserPlus, Users, XCircle } from "lucide-react";
import { getDiasAviso, listarPolizas } from "@/lib/datos";
import { useCarga } from "@/lib/useCarga";
import { diasRestantes, estadoPoliza, fmtFecha } from "@/lib/polizas";
import EstadoBadge from "@/components/EstadoBadge";
import Cargando from "@/components/Cargando";

export default function Tablero() {
  const router = useRouter();
  const { data, error } = useCarga(() => Promise.all([listarPolizas(), getDiasAviso()]));
  if (!data) return <Cargando error={error} />;
  const [polizas, diasAviso] = data;

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
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-ghost text-rose-600"
            onClick={async () => {
              if (!confirm("¿Cerrar sesión?")) return;
              await signOut(auth);
              router.replace("/login");
            }}
          >
            <LogOut size={16} /> Salir
          </button>
          <Link href="/asegurados" className="btn-ghost"><Users size={16} /> Ver asegurados</Link>
          <Link href="/asegurados/nuevo" className="btn-primary"><UserPlus size={16} /> Nuevo asegurado</Link>
        </div>
      </div>

      <Link href="/polizas" className="card flex flex-wrap items-center gap-x-6 gap-y-3 transition hover:border-brand/50">
        <div className="flex items-center gap-4">
          <FileText className="text-brand" size={32} />
          <div>
            <div className="text-3xl font-semibold tabular-nums">{polizas.length}</div>
            <div className="text-sm text-muted">Total de pólizas cargadas</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {ramos.map(([ramo, n]) => (
            <span key={ramo} className="rounded-full bg-black/5 px-3 py-1 text-sm dark:bg-white/10">
              {ramo}: <b className="tabular-nums">{n}</b>
            </span>
          ))}
        </div>
      </Link>

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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="card min-w-0">
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

        <section className="card min-w-0">
          <h2 className="mb-4 font-semibold">Requieren atención</h2>
          {atencion.length === 0 && <p className="text-sm text-muted">Todo al día. No hay pólizas por vencer.</p>}
          <ul className="divide-y divide-line">
            {atencion.map((p) => {
              const d = diasRestantes(p.fin_vigencia);
              return (
                <li key={p.id}>
                  <Link href={`/polizas/${p.id}`} className="flex min-w-0 items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{p.asegurado_nombre}</div>
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
