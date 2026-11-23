// Service worker de Pólizas RC: permite abrir la app y los PDFs guardados sin conexión.
const PAGINAS = "rc-paginas-v1";
const ESTATICOS = "rc-estaticos-v1";
const PDFS = "rc-pdfs";
const VIGENTES = [PAGINAS, ESTATICOS, PDFS];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(PAGINAS).then((c) => c.addAll(["/", "/login"]).catch(() => {})));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => !VIGENTES.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function primeroCache(cacheName, req) {
  const c = await caches.open(cacheName);
  const hit = await c.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) c.put(req, res.clone());
  return res;
}

async function primeroRed(req, url) {
  const c = await caches.open(PAGINAS);
  const clave = url.origin + url.pathname;
  try {
    const res = await fetch(req);
    if (res.ok) c.put(clave, res.clone());
    return res;
  } catch {
    return (await c.match(clave)) || (await c.match(url.origin + "/")) || Response.error();
  }
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // PDFs y archivos de Firebase Storage
  if (url.hostname === "firebasestorage.googleapis.com" && url.searchParams.get("alt") === "media") {
    e.respondWith(primeroCache(PDFS, req));
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (req.headers.get("RSC") || url.searchParams.has("_rsc")) return;

  if (url.pathname.startsWith("/_next/static/") || /\.(svg|png|ico|webmanifest)$/.test(url.pathname)) {
    e.respondWith(primeroCache(ESTATICOS, req));
    return;
  }
  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    e.respondWith(primeroRed(req, url));
  }
});
