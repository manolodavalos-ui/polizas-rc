"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, FileText, LayoutDashboard, Menu, Settings, Users, X } from "lucide-react";

const NAV = [
  { href: "/", label: "Tablero", icon: LayoutDashboard },
  { href: "/polizas", label: "Pólizas", icon: FileText },
  { href: "/asegurados", label: "Asegurados", icon: Users },
  { href: "/graficas", label: "Gráficas y análisis", icon: BarChart3 },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            active(href) ? "bg-brand/10 text-brand" : "text-fg/80 hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <Icon size={18} /> {label}
        </Link>
      ))}
    </nav>
  );

  const brand = (
    <Link href="/" className="flex items-center gap-2 px-5 py-4 text-lg font-semibold">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.svg" alt="" className="h-8 w-8" /> Pólizas RC
    </Link>
  );

  return (
    <div className="min-h-dvh lg:flex">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-line bg-card lg:block">
        {brand}
        {nav}
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-card px-2 lg:hidden">
        {brand}
        <button aria-label="Abrir menú" className="rounded-lg p-2" onClick={() => setOpen(true)}>
          <Menu />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-card shadow-xl">
            <div className="flex items-center justify-between pr-2">
              {brand}
              <button aria-label="Cerrar menú" className="rounded-lg p-2" onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl flex-1 p-4 lg:p-8">{children}</main>
    </div>
  );
}
