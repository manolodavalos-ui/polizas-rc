"use client";
import { RAMOS, type Poliza } from "@/lib/polizas";

export type PolizaCampos = Pick<Poliza, "ramo" | "aseguradora" | "numero_poliza" | "certificado" | "inicio_vigencia" | "fin_vigencia" | "prima" | "moneda" | "notas">;

export const polizaVacia: PolizaCampos = {
  ramo: RAMOS[0], aseguradora: "", numero_poliza: "", certificado: "", inicio_vigencia: "", fin_vigencia: "", prima: null, moneda: "MXN", notas: "",
};

/** Campos de una póliza. Controlado por el componente padre. */
export default function PolizaCamposForm({ value, onChange }: { value: PolizaCampos; onChange: (v: PolizaCampos) => void }) {
  const set = <K extends keyof PolizaCampos>(k: K, v: PolizaCampos[K]) => onChange({ ...value, [k]: v });

  function onInicio(v: string) {
    // Sugerir fin de vigencia a un año
    const next = { ...value, inicio_vigencia: v };
    if (v && !value.fin_vigencia) {
      const [y, m, d] = v.split("-");
      next.fin_vigencia = `${Number(y) + 1}-${m}-${d}`;
    }
    onChange(next);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="label">Ramo *</label>
        <select className="input" required value={value.ramo} onChange={(e) => set("ramo", e.target.value)}>
          {RAMOS.map((r) => <option key={r}>{r}</option>)}
          {!RAMOS.includes(value.ramo) && <option>{value.ramo}</option>}
        </select>
      </div>
      <div>
        <label className="label">Aseguradora *</label>
        <input className="input" required list="aseguradoras" value={value.aseguradora} onChange={(e) => set("aseguradora", e.target.value)} />
        <datalist id="aseguradoras">
          {["AXA", "AXA Keralty", "Allianz", "GNP", "MetLife", "Seguros Monterrey", "Mapfre", "Qualitas", "BBVA Seguros"].map((a) => <option key={a} value={a} />)}
        </datalist>
      </div>
      <div>
        <label className="label">Número de póliza *</label>
        <input className="input" required value={value.numero_poliza} onChange={(e) => set("numero_poliza", e.target.value)} />
      </div>
      <div>
        <label className="label">Certificado</label>
        <input className="input" value={value.certificado ?? ""} onChange={(e) => set("certificado", e.target.value)} />
      </div>
      <div>
        <label className="label">Inicio de vigencia *</label>
        <input type="date" className="input" required value={value.inicio_vigencia} onChange={(e) => onInicio(e.target.value)} />
      </div>
      <div>
        <label className="label">Fin de vigencia *</label>
        <input type="date" className="input" required min={value.inicio_vigencia || undefined} value={value.fin_vigencia} onChange={(e) => set("fin_vigencia", e.target.value)} />
      </div>
      <div>
        <label className="label">Prima</label>
        <input type="number" step="0.01" min="0" className="input" value={value.prima ?? ""} onChange={(e) => set("prima", e.target.value === "" ? null : Number(e.target.value))} />
      </div>
      <div>
        <label className="label">Moneda</label>
        <select className="input" value={value.moneda} onChange={(e) => set("moneda", e.target.value)}>
          <option>MXN</option><option>USD</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="label">Notas</label>
        <textarea className="input" rows={2} value={value.notas ?? ""} onChange={(e) => set("notas", e.target.value)} />
      </div>
    </div>
  );
}

export function limpiarPoliza(v: PolizaCampos) {
  return { ...v, certificado: v.certificado || null, notas: v.notas || null, aseguradora: v.aseguradora.trim(), numero_poliza: v.numero_poliza.trim() };
}
