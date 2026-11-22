"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ConfigForm({ diasAviso, email }: { diasAviso: number; email: string }) {
  const router = useRouter();
  const [dias, setDias] = useState(diasAviso);
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");

  async function guardarDias(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await createClient().from("configuracion").upsert({ clave: "dias_aviso", valor: String(dias) });
    setMsg(error ? error.message : "Guardado.");
    router.refresh();
  }

  async function cambiarPass(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await createClient().auth.updateUser({ password: pass });
    setMsg(error ? error.message : "Contraseña actualizada.");
    setPass("");
  }

  async function salir() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form onSubmit={guardarDias} className="card space-y-3">
        <h2 className="font-semibold">Alertas de vencimiento</h2>
        <div>
          <label className="label">Marcar como &quot;próxima a vencer&quot; cuando falten (días)</label>
          <input type="number" min={1} max={365} className="input" value={dias} onChange={(e) => setDias(Number(e.target.value))} />
        </div>
        <button className="btn-primary">Guardar</button>
      </form>
      <div className="card space-y-3">
        <h2 className="font-semibold">Cuenta</h2>
        <p className="text-sm text-muted">{email}</p>
        <form onSubmit={cambiarPass} className="flex gap-2">
          <input type="password" minLength={8} required placeholder="Nueva contraseña" className="input" value={pass} onChange={(e) => setPass(e.target.value)} />
          <button className="btn-ghost whitespace-nowrap">Cambiar</button>
        </form>
        <button className="btn-ghost text-rose-600" onClick={salir}><LogOut size={16} /> Cerrar sesión</button>
      </div>
      {msg && <p className="text-sm text-muted lg:col-span-2">{msg}</p>}
    </div>
  );
}
