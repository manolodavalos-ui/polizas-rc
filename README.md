# Pólizas RC

App web (PC y móvil) para administrar pólizas de seguros: tablero de vigentes / próximas a vencer / vencidas, pólizas por ramo, asegurados, documentos PDF y gráficas.

**Stack:** Next.js 16 + Tailwind · Firebase (Authentication, Firestore, Storage, App Hosting). Se puede instalar en el celular como app (PWA).

## Puesta en marcha (consola de Firebase)

1. **Plan Blaze** (pago por uso; Storage lo exige). Con este volumen queda dentro de la capa gratuita. Pon una alerta de presupuesto.
2. **Authentication** → Método de acceso → activa *Correo electrónico/contraseña*. En *Usuarios* agrega el usuario principal.
3. **Firestore Database** → crear, modo producción, región `nam5` (o `us-central1`).
4. **Storage** → crear bucket en `us-central1`.
5. **Reglas:** copia `firestore.rules` y `storage.rules` en las pestañas *Reglas* de Firestore y Storage (o `firebase deploy --only firestore:rules,storage`).
6. **App web:** Configuración del proyecto → Tus apps → `</>`. Copia los valores de `firebaseConfig` en `apphosting.yaml` (y en `.env.local` para desarrollo).
7. **Autorizar usuario:** solo entran los usuarios con un documento en `usuarios/{UID}`. El script de carga lo crea; también se puede crear a mano en Firestore (colección `usuarios`, ID = UID del usuario).
8. **App Hosting:** Build → App Hosting → conectar el repo de GitHub, rama `main`. Cada push publica automáticamente.

## Carga inicial

Descarga una llave en Configuración del proyecto → Cuentas de servicio → *Generar nueva clave privada* (no la subas a git), y corre:

```
npm install
node scripts/importar.mjs llave.json correo@usuario.com datos.json "<carpeta del ZIP>" "<relación.xlsx>"
```

`datos.json` es la relación del Excel ya limpia (fechas corregidas). No se versiona porque tiene datos personales. Correr el script dos veces no duplica registros.

## Desarrollo local

```
cp .env.example .env.local   # llena los valores
npm install && npm run dev   # http://localhost:3000
```

## Estructura

- `src/app/(app)/` pantallas: tablero, pólizas, asegurados (alta, detalle), gráficas, configuración
- `src/lib/datos.ts` acceso a Firestore y Storage
- `src/lib/polizas.ts` cálculo de estado (vigente / próxima a vencer / vencida)
- `firestore.rules`, `storage.rules` seguridad
