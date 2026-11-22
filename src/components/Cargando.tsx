export default function Cargando({ error }: { error?: string | null }) {
  if (error) return <p className="card text-sm text-rose-600">No se pudieron cargar los datos: {error}</p>;
  return (
    <div className="flex items-center gap-3 p-6 text-sm text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" /> Cargando…
    </div>
  );
}
