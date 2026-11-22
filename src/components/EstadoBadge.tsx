import { ESTADO_INFO, type Estado } from "@/lib/polizas";

export default function EstadoBadge({ estado }: { estado: Estado }) {
  const info = ESTADO_INFO[estado];
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${info.className}`}>{info.label}</span>;
}
