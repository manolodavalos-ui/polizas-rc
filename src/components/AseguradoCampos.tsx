"use client";
export type AseguradoCampos = { nombre: string; fecha_nacimiento: string; email: string; telefono: string; notas: string };
export const aseguradoVacio: AseguradoCampos = { nombre: "", fecha_nacimiento: "", email: "", telefono: "", notas: "" };

export function limpiarAsegurado(v: AseguradoCampos) {
  return {
    nombre: v.nombre.trim(),
    fecha_nacimiento: v.fecha_nacimiento || null,
    email: v.email.trim() || null,
    telefono: v.telefono.trim() || null,
    notas: v.notas.trim() || null,
  };
}

export default function AseguradoCamposForm({ value, onChange }: { value: AseguradoCampos; onChange: (v: AseguradoCampos) => void }) {
  const set = (k: keyof AseguradoCampos, v: string) => onChange({ ...value, [k]: v });
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="label">Nombre completo *</label>
        <input className="input" required value={value.nombre} onChange={(e) => set("nombre", e.target.value)} />
      </div>
      <div>
        <label className="label">Fecha de nacimiento</label>
        <input type="date" className="input" value={value.fecha_nacimiento} onChange={(e) => set("fecha_nacimiento", e.target.value)} />
      </div>
      <div>
        <label className="label">Teléfono</label>
        <input type="tel" className="input" value={value.telefono} onChange={(e) => set("telefono", e.target.value)} />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Correo</label>
        <input type="email" className="input" value={value.email} onChange={(e) => set("email", e.target.value)} />
      </div>
    </div>
  );
}
