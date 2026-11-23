"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type Serie = { nombre: string; valor: number }[];
type Bloque = { titulo: string; datos: Serie; tipo: "conteo" | "moneda"; vertical?: boolean; ancho?: boolean };

const fmtMXN = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
const fmtCorto = (n: number) => new Intl.NumberFormat("es-MX", { notation: "compact", maximumFractionDigits: 1 }).format(n);

export default function Graficas({ bloques }: { bloques: Bloque[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {bloques.map((b) => (
        <section key={b.titulo} className={`card min-w-0 ${b.ancho ? "lg:col-span-2" : ""}`}>
          <h2 className="mb-3 font-semibold">{b.titulo}</h2>
          {b.datos.length === 0 ? (
            <p className="text-sm text-muted">Sin datos.</p>
          ) : (
            <div style={{ height: b.vertical ? 260 : Math.max(140, b.datos.length * 44) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={b.datos} layout={b.vertical ? "horizontal" : "vertical"} margin={{ left: 8, right: 24, top: 4, bottom: 4 }} barCategoryGap={b.vertical ? 4 : 10}>
                  <CartesianGrid strokeDasharray="0" stroke="var(--border)" vertical={!b.vertical} horizontal={!!b.vertical} />
                  {b.vertical ? (
                    <>
                      <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: "var(--muted)" }} interval={0} angle={-35} textAnchor="end" height={44} stroke="var(--border)" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted)" }} width={28} stroke="var(--border)" />
                    </>
                  ) : (
                    <>
                      <XAxis type="number" allowDecimals={false} tickFormatter={b.tipo === "moneda" ? fmtCorto : undefined} tick={{ fontSize: 11, fill: "var(--muted)" }} stroke="var(--border)" />
                      <YAxis type="category" dataKey="nombre" interval={0} width={b.ancho ? 130 : 150} tick={{ fontSize: 12, fill: "var(--fg)" }} stroke="var(--border)" />
                    </>
                  )}
                  <Tooltip
                    cursor={{ fill: "var(--border)", opacity: 0.5 }}
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--fg)", fontSize: 12 }}
                    formatter={(v) => [b.tipo === "moneda" ? fmtMXN(Number(v)) : String(v), b.tipo === "moneda" ? "Prima" : "Pólizas"]}
                  />
                  <Bar dataKey="valor" fill="var(--brand)" radius={b.vertical ? [4, 4, 0, 0] : [0, 4, 4, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
