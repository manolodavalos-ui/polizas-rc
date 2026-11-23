"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopiarTexto({ texto }: { texto: string }) {
  const [ok, setOk] = useState(false);
  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setOk(true);
      setTimeout(() => setOk(false), 1500);
    } catch {}
  }
  return (
    <button type="button" onClick={copiar} aria-label="Copiar número de póliza" title={ok ? "Copiado" : "Copiar"} className="inline-flex items-center rounded p-1 text-muted hover:text-brand">
      {ok ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
    </button>
  );
}
