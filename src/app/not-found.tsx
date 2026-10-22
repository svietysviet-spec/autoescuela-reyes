import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-[640px] flex-col items-start px-4 py-24 sm:px-6">
      <p className="eyebrow mb-2">Error 404</p>
      <h1 className="h1">Esta página no existe.</h1>
      <p className="lead mt-4">Puede que se haya movido. Vuelve al inicio para encontrar tu permiso.</p>
      <div className="mt-8">
        <Button href="/" arrow>
          Ir al inicio
        </Button>
      </div>
    </section>
  );
}
