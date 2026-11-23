"use client";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function BotonSalir({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      className={`btn-ghost text-rose-600 ${className}`}
      onClick={async () => {
        if (!confirm("¿Cerrar sesión?")) return;
        await signOut(auth);
        router.replace("/login");
      }}
    >
      <LogOut size={16} /> Salir
    </button>
  );
}
