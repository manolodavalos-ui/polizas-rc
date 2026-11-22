"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { subirDocumentos } from "@/lib/subir";
import AseguradoCamposForm, { aseguradoVacio, limpiarAsegurado } from "./AseguradoCampos";
import PolizaCamposForm, { limpiarPoliza, polizaVacia } from "./PolizaForm";

export default function NuevoForm({ existente }: { existente: { id: string; nombre: string } | null }) {
  const router = useRouter();
  const [aseg, setAseg] = useState(aseguradoVacio);
  const [pol, setPol] = useState(polizaVacia);
  const [pdfPoliza, setPdfPoliza] = useState<File | null>(null);
  const [pdfTarjeta, setPdfTarjeta] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createClient();
    let creadoId: string | null = null;
    try {
      let aseguradoId = existente?.id;
      if (!aseguradoId) {
        const { data, error } = await supabase.from("asegurados").insert(limpiarAsegurado(aseg)).select("id").single();
        if (error) throw error;
        aseguradoId = creadoId = data.id;
      }
      const { data: p, error } = await supabase.from("polizas").insert({ ...limpiarPoliza(pol), asegurado_id: aseguradoId }).select("id").single();
      if (error) throw error;
      const archivos = [
        ...(pdfPoliza ? [{ file: pdfPoliza, tipo: "poliza" }] : []),
        ...(pdfTarjeta ? [{ file: pdfTarjeta, tipo: "tarjeta" }] : []),
      ];
      await subirDocumentos(supabase, archivos, { poliza_id: p.id, asegurado_id: aseguradoId });
      router.push(`/asegurados/${aseguradoId}`);
      router.refresh();
    } catch (err) {
      // Si falló al crear un asegurado nuevo, no dejarlo a medias
      if (creadoId) await supabase.from("asegurados").delete().eq("id", creadoId);
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={guardar} className="mx-auto max-w-2xl space-y-4">
      <Link href={existente ? `/asegurados/${existente.id}` : "/asegurados"} className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
        <ArrowLeft size={16} /> {existente ? existente.nombre : "Asegurados"}
      </Link>
      <h1 className="text-2xl font-semibold">{existente ? "Agregar póliza" : "Nuevo asegurado"}</h1>

      {!existente && (
        <section className="card space-y-3">
          <h2 className="font-semibold">1. Datos del asegurado</h2>
          <AseguradoCamposForm value={aseg} onChange={setAseg} />
        </section>
      )}

      <section className="card space-y-3">
        <h2 className="font-semibold">{existente ? "1" : "2"}. Póliza</h2>
        <PolizaCamposForm value={pol} onChange={setPol} />
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">{existente ? "2" : "3"}. Documentos (PDF)</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Póliza / carátula</label>
            <input type="file" accept=".pdf,image/*" className="input" onChange={(e) => setPdfPoliza(e.target.files?.[0] ?? null)} />
          </div>
          <div>
            <label className="label">Tarjeta médica (opcional)</label>
            <input type="file" accept=".pdf,image/*" className="input" onChange={(e) => setPdfTarjeta(e.target.files?.[0] ?? null)} />
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <Link href="/asegurados" className="btn-ghost">Cancelar</Link>
        <button className="btn-primary" disabled={busy}>{busy ? "Guardando…" : "Guardar"}</button>
      </div>
    </form>
  );
}
