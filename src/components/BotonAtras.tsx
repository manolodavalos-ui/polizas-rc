"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Botón "atrás" del celular:
 * - Fuera del tablero: siempre regresa al tablero.
 * - En el tablero: pregunta si desea salir.
 */
export default function BotonAtras({ inicio = "/" }: { inicio?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const ruta = useRef(pathname);
  const saliendo = useRef(false);
  const sinGuardia = useRef(false); // tras intentar cerrar, deja que el siguiente "atrás" cierre la app
  const [preguntar, setPreguntar] = useState(false);
  const [aviso, setAviso] = useState(false);

  useEffect(() => {
    ruta.current = pathname;
    if (pathname !== inicio) sinGuardia.current = false;
    // En el tablero agrega una entrada "guardia" para atrapar el atrás.
    // Se repite al tocar la pantalla: Chrome ignora entradas creadas sin interacción del usuario.
    const guardia = () => {
      if (ruta.current === inicio && !saliendo.current && !sinGuardia.current && !window.history.state?.__guardia) {
        window.history.pushState({ ...window.history.state, __guardia: true }, "");
      }
    };
    guardia();
    window.addEventListener("pointerdown", guardia, true);
    return () => window.removeEventListener("pointerdown", guardia, true);
  }, [pathname, inicio]);

  useEffect(() => {
    function onPop(e: PopStateEvent) {
      if (saliendo.current) {
        e.stopImmediatePropagation();
        window.history.back();
        return;
      }
      e.stopImmediatePropagation();
      if (ruta.current === inicio) {
        setPreguntar(true);
      } else {
        router.replace(inicio);
      }
    }
    const onSalir = () => setPreguntar(true);
    window.addEventListener("popstate", onPop, true);
    window.addEventListener("rc:salir", onSalir);
    return () => {
      window.removeEventListener("popstate", onPop, true);
      window.removeEventListener("rc:salir", onSalir);
    };
  }, [router, inicio]);

  function quedarse() {
    setPreguntar(false);
    if (!window.history.state?.__guardia) window.history.pushState({ ...window.history.state, __guardia: true }, "");
  }

  function salir() {
    setPreguntar(false);
    // Cierra la app sin cerrar sesión: intenta cerrar la ventana y, si el sistema no lo permite,
    // regresa por el historial hasta salir de la app.
    window.close();
    saliendo.current = true;
    window.history.back();
    setTimeout(() => {
      saliendo.current = false;
      // Si seguimos aquí, el sistema no permitió cerrar: el siguiente "atrás" la cierra
      if (document.visibilityState === "visible") {
        sinGuardia.current = true;
        setAviso(true);
      }
    }, 1500);
  }

  if (aviso) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setAviso(false)}>
        <div className="card w-full max-w-xs space-y-4" onClick={(e) => e.stopPropagation()}>
          <p className="text-sm">Tu teléfono no permite que la app se cierre sola. Presiona el botón atrás o inicio para cerrarla. Tu sesión sigue activa.</p>
          <div className="flex justify-end"><button className="btn-primary" onClick={() => setAviso(false)}>Entendido</button></div>
        </div>
      </div>
    );
  }
  if (!preguntar) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={quedarse}>
      <div className="card w-full max-w-xs space-y-4" onClick={(e) => e.stopPropagation()}>
        <p className="font-medium">¿Desea cerrar la aplicación?</p>
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={quedarse}>Cancelar</button>
          <button className="btn-primary" onClick={salir}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
