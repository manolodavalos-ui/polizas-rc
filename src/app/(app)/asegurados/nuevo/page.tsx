"use client";
import { use } from "react";
import { getAsegurado } from "@/lib/datos";
import { useCarga } from "@/lib/useCarga";
import NuevoForm from "@/components/NuevoForm";
import Cargando from "@/components/Cargando";

export default function NuevoPage({ searchParams }: { searchParams: Promise<{ asegurado?: string }> }) {
  const { asegurado } = use(searchParams);
  const { data, error } = useCarga(async () => (asegurado ? await getAsegurado(asegurado) : null), [asegurado]);
  if (asegurado && data === null) return <Cargando error={error} />;
  return <NuevoForm existente={data ? { id: data.id, nombre: data.nombre } : null} />;
}
