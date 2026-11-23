"use client";
import { LogOut } from "lucide-react";

/** Pide cerrar la aplicación (sin cerrar sesión). El diálogo lo muestra BotonAtras. */
export default function BotonSalir({ className = "" }: { className?: string }) {
  return (
    <button className={`btn-ghost text-rose-600 ${className}`} onClick={() => window.dispatchEvent(new Event("rc:salir"))}>
      <LogOut size={16} /> Salir
    </button>
  );
}
