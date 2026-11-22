"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { ESTADO_INFO, fmtFecha, fmtMoneda, type Estado, type Poliza } from "@/lib/polizas";
import EstadoBadge from "./EstadoBadge";

type Fila = Poliza & { estado: Estado };

export default function TablaPolizas({ filas, estadoInicial = "", ramoInicial = "", ocultarAsegurado = false }: {
  filas: Fila[];
  estadoInicial?: string;
  ramoInicial?: string;
  ocultarAsegurado?: boolean;
}) {
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState(estadoInicial);
  const [ramo, setRamo] = useState(ramoInicial);
  const ramos = useMemo(() => [...new Set(filas.map((f) => f.ramo))].sort(), [filas]);

  const visibles = filas.filter((f) => {
    if (estado && f.estado !== estado) return false;
    if (ramo && f.ramo !== ramo) return false;
    if (q) {
      const t = `${f.asegurado_nombre} ${f.numero_poliza} ${f.certificado ?? ""} ${f.aseguradora}`.toLowerCase();
      if (!t.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  function exportarCSV() {
    const enc = ["Asegurado", "Ramo", "Aseguradora", "Póliza", "Certificado", "Inicio", "Fin", "Prima", "Estado"];
    const rows = visibles.map((f) => [
      f.asegurado_nombre ?? "", f.ramo, f.aseguradora, f.numero_poliza, f.certificado ?? "",
      fmtFecha(f.inicio_vigencia), fmtFecha(f.fin_vigencia), f.prima ?? "", ESTADO_INFO[f.estado].label,
    ]);
    const csv = [enc, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "polizas.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {!ocultarAsegurado && (
          <div className="relative min-w-48 flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-muted" />
            <input className="input pl-9" placeholder="Buscar asegurado o número…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        )}
        <select className="input w-auto" value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADO_INFO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="input w-auto" value={ramo} onChange={(e) => setRamo(e.target.value)}>
          <option value="">Todos los ramos</option>
          {ramos.map((r) => <option key={r}>{r}</option>)}
        </select>
        <button className="btn-ghost" onClick={exportarCSV}><Download size={16} /> Exportar</button>
      </div>

      <p className="text-xs text-muted">{visibles.length} de {filas.length} pólizas</p>

      {/* Tabla en PC */}
      <div className="card hidden overflow-x-auto p-0 md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-xs uppercase text-muted">
            <tr>
              {!ocultarAsegurado && <th className="p-3">Asegurado</th>}
              <th className="p-3">Ramo</th>
              <th className="p-3">Aseguradora</th>
              <th className="p-3">Póliza</th>
              <th className="p-3">Vigencia</th>
              <th className="p-3 text-right">Prima</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visibles.map((f) => (
              <tr key={f.id} className="hover:bg-black/[.02] dark:hover:bg-white/[.03]">
                {!ocultarAsegurado && <td className="p-3"><Link className="font-medium hover:text-brand" href={`/polizas/${f.id}`}>{f.asegurado_nombre}</Link></td>}
                <td className="p-3">{f.ramo}</td>
                <td className="p-3">{f.aseguradora}</td>
                <td className="p-3"><Link className="hover:text-brand" href={`/polizas/${f.id}`}>{f.numero_poliza}{f.certificado ? ` / ${f.certificado}` : ""}</Link></td>
                <td className="whitespace-nowrap p-3">{fmtFecha(f.inicio_vigencia)} – {fmtFecha(f.fin_vigencia)}</td>
                <td className="p-3 text-right tabular-nums">{fmtMoneda(f.prima, f.moneda)}</td>
                <td className="p-3"><EstadoBadge estado={f.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas en móvil */}
      <ul className="space-y-2 md:hidden">
        {visibles.map((f) => (
          <li key={f.id}>
            <Link href={`/polizas/${f.id}`} className="card block space-y-1">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium">{ocultarAsegurado ? f.ramo : f.asegurado_nombre}</span>
                <EstadoBadge estado={f.estado} />
              </div>
              <div className="text-xs text-muted">{ocultarAsegurado ? "" : `${f.ramo} · `}{f.aseguradora} · {f.numero_poliza}{f.certificado ? ` / ${f.certificado}` : ""}</div>
              <div className="flex justify-between text-xs">
                <span>Vence {fmtFecha(f.fin_vigencia)}</span>
                <span className="tabular-nums">{fmtMoneda(f.prima, f.moneda)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
