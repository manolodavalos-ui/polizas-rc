"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Botón "atrás" del celular:
 * - Fuera del tablero: siempre regresa al tablero.
 * - En el tablero: pregunta si desea salir.
 */
export default function BotonAtras() {
  const pathname = usePathname();
  const router = useRouter();
  const ruta = useRef(pathname);
  const saliendo = useRef(false);
  const [preguntar, setPreguntar] = useState(false);

  useEffect(() => {
    ruta.current = pathname;
    // En el tablero agrega una entrada "guardia" para atrapar el atrás
    if (pathname === "/" && !window.history.state?.__guardia) {
      window.history.pushState({ ...window.history.state, __guardia: true }, "");
    }
  }, [pathname]);

  useEffect(() => {
    function onPop(e: PopStateEvent) {
      if (saliendo.current) {
        e.stopImmediatePropagation();
        window.history.back();
        return;
      }
      e.stopImmediatePropagation();
      if (ruta.current === "/") {
        setPreguntar(true);
      } else {
        router.replace("/");
      }
    }
    window.addEventListener("popstate", onPop, true);
    return () => window.removeEventListener("popstate", onPop, true);
  }, [router]);

  function quedarse() {
    setPreguntar(false);
    window.history.pushState({ ...window.history.state, __guardia: true }, "");
  }

  function salir() {
    setPreguntar(false);
    saliendo.current = true;
    window.history.back();
    // Si ya no hay a dónde regresar, el siguiente "atrás" cierra la app
    setTimeout(() => { saliendo.current = false; }, 1500);
  }

  if (!preguntar) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={quedarse}>
      <div className="card w-full max-w-xs space-y-4" onClick={(e) => e.stopPropagation()}>
        <p className="font-medium">¿Deseas salir de Pólizas RC?</p>
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={quedarse}>Cancelar</button>
          <button className="btn-primary" onClick={salir}>Salir</button>
        </div>
      </div>
    </div>
  );
}
