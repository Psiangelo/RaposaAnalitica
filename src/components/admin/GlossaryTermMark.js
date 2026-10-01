import { Mark, mergeAttributes } from '@tiptap/core';

/**
 * GlossaryTermMark — marcação manual de termo do glossário dentro do post.
 *
 * Existe porque o autolink automático (src/lib/glossaryLinker.js) só acerta o
 * óbvio: casa a grafia do termo ou de um alias. Não sabe que «aquele núcleo
 * afetivo» é complexo, nem que num parágrafo específico «a imagem» quer dizer
 * arquétipo. Isso quem sabe é quem escreveu, e precisa poder marcar à mão.
 *
 * Grava no HTML como `<span data-termo="slug">texto</span>`, e NÃO como uma
 * âncora pronta. O motivo é importante: a definição curta e o título do
 * verbete mudam quando o glossário é reescrito, e uma âncora congelada no
 * conteúdo do post carregaria para sempre o texto do dia em que foi criada.
 * O span é só um ponteiro; a âncora de verdade é montada no build, com o
 * conteúdo atual do verbete.
 *
 * Regras de uso no editor: a marca guarda apenas o slug. Se o verbete for
 * renomeado (slug novo), a marca deixa de resolver e o texto fica como texto
 * comum — sem link quebrado, e é isso que se quer.
 */
export const GlossaryTermMark = Mark.create({
  name: 'glossaryTerm',

  // não deve grudar em texto digitado logo depois da marca
  inclusive: false,

  addAttributes() {
    return {
      slug: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-termo'),
        renderHTML: (attrs) => (attrs.slug ? { 'data-termo': attrs.slug } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-termo]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { class: 'termo-marcado' }), 0];
  },

  addCommands() {
    return {
      setGlossaryTerm:
        (slug) =>
        ({ commands }) =>
          commands.setMark(this.name, { slug }),
      unsetGlossaryTerm:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});

export default GlossaryTermMark;
