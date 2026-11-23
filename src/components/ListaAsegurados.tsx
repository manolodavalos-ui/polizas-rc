"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Search, UserPlus } from "lucide-react";
import { edad } from "@/lib/polizas";

type Fila = { id: string; nombre: string; fecha_nacimiento: string | null; total: number; porVencer: number; vencidas: number; ramos: string[] };

export default function ListaAsegurados({ filas }: { filas: Fila[] }) {
  const [q, setQ] = useState("");
  const [ramo, setRamo] = useState("");
  const ramos = [...new Set(filas.flatMap((f) => f.ramos))].sort();
  const chips = [{ k: "", label: "Todos", n: filas.length }, ...ramos.map((r) => ({ k: r, label: r, n: filas.filter((f) => f.ramos.includes(r)).length }))];
  const visibles = filas.filter((f) => (!ramo || f.ramos.includes(ramo)) && f.nombre.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Asegurados</h1>
        <Link href="/asegurados/nuevo" className="btn-primary"><UserPlus size={16} /> Nuevo asegurado</Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.k}
            onClick={() => setRamo(c.k)}
            className={`rounded-full border px-3 py-1 text-sm transition ${ramo === c.k ? "border-brand bg-brand text-white" : "border-line bg-card hover:border-brand/50"}`}
          >
            {c.label} <b className="tabular-nums">{c.n}</b>
          </button>
        ))}
      </div>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-2.5 text-muted" />
        <input className="input pl-9" placeholder="Buscar por nombre…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <ul className="card divide-y divide-line p-0">
        {visibles.length === 0 && <li className="p-4 text-sm text-muted">Sin resultados.</li>}
        {visibles.map((f) => (
          <li key={f.id}>
            <Link href={`/asegurados/${f.id}`} className="flex items-center gap-3 p-3 hover:bg-black/[.02] dark:hover:bg-white/[.03]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                {f.nombre.split(" ").slice(0, 2).map((s) => s[0]).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{f.nombre}</div>
                <div className="text-xs text-muted">
                  {f.total} pólizas{edad(f.fecha_nacimiento) != null ? ` · ${edad(f.fecha_nacimiento)} años` : ""}
                </div>
              </div>
              <div className="flex gap-1 text-xs">
                {f.porVencer > 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">{f.porVencer} por vencer</span>}
                {f.vencidas > 0 && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">{f.vencidas} vencidas</span>}
              </div>
              <ChevronRight size={16} className="text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
