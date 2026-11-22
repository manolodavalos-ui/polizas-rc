"use client";
import { getDiasAviso, listarDocumentos } from "@/lib/datos";
import { auth } from "@/lib/firebase";
import { useCarga } from "@/lib/useCarga";
import Documentos from "@/components/Documentos";
import ConfigForm from "@/components/ConfigForm";
import Cargando from "@/components/Cargando";

export default function ConfiguracionPage() {
  const { data, error, recargar } = useCarga(() => Promise.all([getDiasAviso(), listarDocumentos({ generales: true })]));
  if (!data) return <Cargando error={error} />;
  const [diasAviso, docs] = data;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Configuración</h1>
      <ConfigForm diasAviso={diasAviso} email={auth.currentUser?.email ?? ""} />
      <section className="card">
        <h2 className="mb-1 font-semibold">Documentos generales</h2>
        <p className="mb-3 text-sm text-muted">Relaciones en Excel, condiciones generales y otros archivos que no son de una sola póliza.</p>
        <Documentos docs={docs} tipoDefault="excel" onCambio={recargar} />
      </section>
    </div>
  );
}
