"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/");
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      const msg: Record<string, string> = {
        "auth/invalid-credential": "Correo o contraseña incorrectos.",
        "auth/wrong-password": "Correo o contraseña incorrectos.",
        "auth/user-not-found": "Ese correo no está registrado.",
        "auth/invalid-email": "El correo no es válido.",
        "auth/operation-not-allowed": "El acceso con correo y contraseña no está activado en Firebase.",
        "auth/too-many-requests": "Demasiados intentos. Espera unos minutos.",
        "auth/unauthorized-domain": "Este dominio no está autorizado en Firebase Authentication.",
      };
      setError(`${msg[code] ?? "No se pudo iniciar sesión."} (${code || "error"})`);
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-4">
      <form onSubmit={onSubmit} className="card w-full max-w-sm space-y-4 p-6">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="" className="h-10 w-10" />
          <div>
            <h1 className="text-xl font-semibold">Pólizas RC</h1>
            <p className="text-sm text-muted">Inicia sesión para continuar</p>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="email">Correo</label>
          <input id="email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="password">Contraseña</label>
          <input id="password" type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Entrando…" : "Entrar"}</button>
      </form>
      <footer className="flex flex-col items-center gap-1 text-center text-xs text-muted">
        <span>Desarrollado por</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/integram.png" alt="INTEGRAM" className="h-8 w-auto rounded bg-white px-2 py-1" />
        <span>Imagina, crea. · Consultoría y soluciones de IA</span>
        <span>v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
      </footer>
    </main>
  );
}
