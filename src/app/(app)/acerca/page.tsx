import { MessageCircle, Phone } from "lucide-react";

export default function AcercaPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Acerca de Pólizas RC</h1>
        <p className="text-sm text-muted">Administración de pólizas de seguros · versión {process.env.NEXT_PUBLIC_APP_VERSION}</p>
      </div>

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">Sobre nosotros</h2>
        <div className="rounded-lg bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/integram.png" alt="INTEGRAM · Imagina, crea." className="mx-auto h-auto w-full max-w-md" />
        </div>
        <p className="text-sm font-medium text-muted">Desarrollado por INTEGRAM</p>
        <div className="space-y-3 text-justify text-sm leading-relaxed">
          <p>En INTEGRAM creemos que la tecnología debe adaptarse a las personas y a sus necesidades, no al contrario.</p>
          <p>
            Somos una empresa especializada en consultoría, desarrollo de soluciones digitales e integración de inteligencia
            artificial, enfocada en transformar ideas en herramientas prácticas, inteligentes y eficientes.
          </p>
          <p>
            Esta aplicación ha sido diseñada y desarrollada con el propósito de simplificar procesos, optimizar recursos y
            ofrecer una experiencia funcional, intuitiva y confiable.
          </p>
          <p>
            Combinamos creatividad, tecnología, automatización e inteligencia artificial para construir soluciones que
            evolucionan junto con las necesidades de cada proyecto.
          </p>
        </div>
      </section>

      <section className="card space-y-3">
        <div>
          <h2 className="text-lg font-semibold">INTEGRAM</h2>
          <p className="text-sm italic text-brand">Imagina, crea.</p>
          <p className="text-sm text-muted">Consultoría y soluciones de Inteligencia Artificial</p>
        </div>
        <div className="border-t border-line pt-3">
          <p className="font-medium">Ing. Manuel Alberto López Dávalos</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <a href="tel:+529611080808" className="btn-ghost"><Phone size={16} /> 961 108 0808</a>
            <a href="https://wa.me/529611080808" target="_blank" rel="noreferrer" className="btn-primary">
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
