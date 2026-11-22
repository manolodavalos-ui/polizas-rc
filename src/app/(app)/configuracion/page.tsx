import { createClient } from "@/lib/supabase/server";
import { getDiasAviso } from "@/lib/config";
import { conUrls } from "@/lib/docs-server";
import type { Documento } from "@/lib/polizas";
import Documentos from "@/components/Documentos";
import ConfigForm from "@/components/ConfigForm";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const diasAviso = await getDiasAviso();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: docs } = await supabase.from("documentos").select("*").is("poliza_id", null).is("asegurado_id", null).order("created_at");
  const docsUrl = await conUrls(supabase, (docs ?? []) as Documento[]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Configuración</h1>
      <ConfigForm diasAviso={diasAviso} email={user?.email ?? ""} />
      <section className="card">
        <h2 className="mb-1 font-semibold">Documentos generales</h2>
        <p className="mb-3 text-sm text-muted">Relaciones en Excel, condiciones generales y otros archivos que no son de una sola póliza.</p>
        <Documentos docs={docsUrl} tipoDefault="excel" />
      </section>
    </div>
  );
}
