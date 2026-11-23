/**
 * Control de versiones de Pólizas RC (versionado semántico X.Y.Z).
 * - X (mayor): se queda en 0 hasta la entrega formal a Root Capital (1.0.0).
 * - Y (menor): funciones nuevas.
 * - Z (corrección): ajustes y correcciones.
 * Para publicar: agrega la nueva versión ARRIBA. La primera de la lista es la versión actual.
 */
export type Cambio = { version: string; fecha: string; cambios: string[] };

export const CAMBIOS: Cambio[] = [
  { version: "0.4.6", fecha: "2026-11-22", cambios: ["Más rápida: muestra al instante la información guardada en el equipo y la actualiza desde la nube en segundo plano."] },
  { version: "0.4.5", fecha: "2026-11-22", cambios: ["Salir ahora pregunta \"¿Desea cerrar la aplicación?\" y cierra la app sin cerrar sesión (cerrar sesión sigue en Configuración)."] },
  { version: "0.4.4", fecha: "2026-11-22", cambios: ["Gráficas: se muestran todos los nombres en Prima por asegurado.", "Control de versiones e historial de cambios."] },
  { version: "0.4.3", fecha: "2026-11-22", cambios: ["Acerca de: texto justificado sin dividir palabras."] },
  { version: "0.4.2", fecha: "2026-11-22", cambios: ["Botón Salir en la barra superior, a la derecha."] },
  { version: "0.4.1", fecha: "2026-11-22", cambios: ["Botón atrás más confiable en Android.", "Número de versión junto al nombre en el menú."] },
  {
    version: "0.4.0", fecha: "2026-11-22",
    cambios: [
      "Uso sin conexión: datos locales sincronizados y descarga de PDFs.",
      "App instalable en el teléfono.",
      "Botón atrás regresa al tablero y pregunta antes de salir.",
      "Botón Salir y sin refrescar al jalar la pantalla.",
    ],
  },
  {
    version: "0.3.0", fecha: "2026-11-22",
    cambios: [
      "Filtro de estado desde el tablero y aviso cuando no hay pólizas.",
      "Documentos: ver, compartir y sección Agregar más documentos.",
      "Copiar número de póliza.",
      "Asegurados: filtro rápido por ramo.",
      "Gráficas: prima por asegurado.",
      "Ajustes de pantalla en móvil.",
    ],
  },
  { version: "0.2.1", fecha: "2026-11-22", cambios: ["Tablero: total de pólizas cargadas por ramo."] },
  { version: "0.2.0", fecha: "2026-11-22", cambios: ["Sección Acerca de.", "Pie Desarrollado por INTEGRAM en el inicio de sesión.", "Configuración: versión y buscar actualización."] },
  { version: "0.1.0", fecha: "2026-11-22", cambios: ["Primera versión: tablero, pólizas, asegurados, documentos, gráficas y configuración."] },
];

export const VERSION_ACTUAL = CAMBIOS[0].version;
