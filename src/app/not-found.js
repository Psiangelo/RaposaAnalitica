import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Figura from '@/components/raposa/Figura';
import Icone from '@/components/raposa/Icone';

export const metadata = {
  title: 'Essa trilha sumiu na mata',
  robots: { index: false, follow: true },
};

/** 404: a raposa sumiu na toca (a nota 5 do OC 13 §241, com graça). */
export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-[80vh] overflow-hidden flex items-center pt-[var(--nav-h)]">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-[1fr_0.8fr] gap-10 items-center">
          <div>
            <p className="font-sans text-[13px] font-semibold uppercase tracking-[0.16em] text-accent mb-5">Erro 404</p>
            <h1 className="font-serif text-[clamp(2.6rem,6.5vw,4.8rem)] leading-[1] font-extrabold tracking-[-0.02em] text-text-bright" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
              Essa trilha <em className="italic text-accent-bright">sumiu na mata</em>.
            </h1>
            <p className="mt-6 font-body text-[1.12rem] leading-relaxed text-text max-w-[46ch]">
              Entrei na toca e levei a página junto. Pode ser que ela tenha mudado de lugar, ou que nunca tenha existido. Daqui dá para voltar ao caminho.
            </p>
            <div className="btn-row mt-8">
              <Link href="/blog/" className="btn btn--solid">
                <Icone nome="pincel" size={18} /> Ler os ensaios
              </Link>
              <Link href="/" className="btn btn--ghost">
                <Icone nome="caminho" size={18} /> Voltar ao início
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[360px] aspect-square">
            <div className="absolute inset-[6%] rounded-full bg-[var(--fundo-2)]" />
            <div className="absolute left-[18%] right-[18%] bottom-[16%] h-[26%] rounded-[50%] bg-[var(--tinta)]" />
            <Figura nome="fig/raposa-so-a-cauda" alt="Só a cauda da raposa aparecendo na toca" prioridade className="absolute left-1/2 -translate-x-1/2 bottom-[24%] w-[34%] rotate-[8deg]" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
