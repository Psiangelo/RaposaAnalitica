'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VisibilityGate from '@/components/VisibilityGate';
import Hero from '@/components/home/Hero';
import Newsletter from '@/components/ui/Newsletter';
import Cartography from '@/components/home/Cartography';
import Toca from '@/components/raposa/Toca';
import {
  EnsaioDestaque, UltimosEnsaios, VerbetesHome, TrilhasHome, PesquisaHome,
  LojaHome, QuemEscreve, ConverseComigo, usePublicados,
} from '@/components/home/Secoes';
import { useVisibility } from '@/lib/useVisibility';
import { useHomeSections } from '@/lib/useHomeSections';

/**
 * A home é blog primeiro: a floresta, o ensaio em destaque, os últimos
 * ensaios, e depois o resto da mata (verbetes, trilhas, pesquisa, cartas,
 * a Toca da Raposa, loja, quem escreve, conversa). A ordem e o que aparece são do painel
 * (Admin → Página inicial → Ordem das seções e Visibilidade).
 */
export default function HomePage() {
  const { visibility: v } = useVisibility();
  const sections = useHomeSections();
  const posts = usePublicados();
  const comDestaque = v.ensaioDestaque !== false && posts.length > 0;

  const RENDERERS = {
    hero: () => <Hero />,
    featuredEssay: () => (comDestaque ? <EnsaioDestaque /> : null),
    blog: () => (v.blog !== false ? <UltimosEnsaios pular={comDestaque ? 1 : 0} limite={6} /> : null),
    verbetes: () => (v.glossario !== false && v.verbetesHome !== false ? <VerbetesHome /> : null),
    estudos: () => (v.estudos !== false ? <TrilhasHome /> : null),
    servicos: () => (v.servicos !== false && v.servicosHome !== false ? <PesquisaHome /> : null),
    newsletter: () => (v.newsletter !== false ? <Newsletter source="home" /> : null),
    toca: () => <Toca />,
    loja: () => (v.loja !== false && v.lojaHome !== false ? <LojaHome /> : null),
    about: () => (v.about !== false ? <QuemEscreve compacto /> : null),
    contato: () => (v.contato !== false ? <ConverseComigo /> : null),
    cartografia: () => (v.cartografia ? <Cartography /> : null),
  };

  return (
    <VisibilityGate visibilityKey="home" title="Página inicial indisponível">
      <Navbar />
      <main id="conteudo">
        {sections.map((id) => {
          const fn = RENDERERS[id];
          const node = fn ? fn() : null;
          return node ? <div key={id}>{node}</div> : null;
        })}
      </main>
      <Footer />
    </VisibilityGate>
  );
}
