"use client";
import { useEffect, useRef, useState } from "react";

/** Carga datos asíncronos cuando cambian `deps`; `recargar()` vuelve a pedirlos. */
export function useCarga<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [n, setN] = useState(0);
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });
  const clave = JSON.stringify(deps);
  useEffect(() => {
    let vivo = true;
    fnRef.current()
      .then((d) => {
        if (vivo) {
          setData(d);
          setError(null);
        }
      })
      .catch((e: Error) => vivo && setError(e.message));
    return () => {
      vivo = false;
    };
  }, [clave, n]);
  return { data, error, recargar: () => setN((x) => x + 1) };
}
