'use client';

import { useEffect, useRef } from 'react';
import { getGlossario, getGlossarioCategories, mascaraInfo } from '@/lib/sitedata';
import { BASE_PATH } from '@/lib/site';

/** slug do verbete → a máscara da categoria dele (cor e figura). */
function mapaDeMascaras() {
  const cats = getGlossarioCategories(true);
  const out = {};
  for (const g of getGlossario(true)) {
    const c = cats.find((x) => x.slug === g.category);
    out[g.slug] = mascaraInfo(g.mascara || c?.mascara);
  }
  return out;
}

/**
 * TermPreview — card do verbete sem sair da página.
 *
 * Os <a class="term-link"> já existem no HTML estático (inseridos em
 * build-time por src/lib/glossaryLinker.js dentro de BlogPostView) — isso
 * NUNCA muda aqui: o href continua um link real pro verbete, pro leitor sem
 * JS e pro Google. Este componente só ENRIQUECE o comportamento client-side:
 *
 *  - Desktop (hover capaz): passar o mouse já mostra o card como prévia
 *    rápida (não "firmada" — some ao tirar o mouse).
 *  - Clicar no termo (com botão esquerdo, sem Ctrl/Cmd) FIRMA o card aberto
 *    e cancela a navegação (preventDefault). O card fica na tela até Esc,
 *    clique fora ou o botão de fechar.
 *  - Dentro do card, o link "ver verbete completo →" navega pro /verbetes/
 *    <slug>/ em NOVA ABA (target=_blank), porque é ele quem carrega o href
 *    real — clicar no termo em si nunca mais navega direto.
 *  - Ctrl/Cmd+clique ou clique do botão do meio no termo: não interceptamos.
 *    O navegador abre em nova aba/janela normalmente, como o usuário pediu.
 *  - Toque (mobile, sem :hover): o toque no termo abre o card firmado
 *    (mesmo comportamento do clique firmado no desktop) — não existe
 *    "primeiro toque = preview, segundo toque = navega" porque o termo em
 *    si nunca navega mais; só o link interno do card navega.
 *
 * Acessibilidade: foco no link mostra o card (prévia, como o hover); Enter
 * no link ativa o <a> nativo, que cai no mesmo tratamento de clique (firma
 * o card). Esc fecha e devolve o foco ao termo. Tab a partir do termo, com
 * o card aberto, entra no card (botão fechar → link "ver verbete completo")
 * antes de seguir pro resto da página — implementado interceptando Tab no
 * termo e no botão de fechar, já que o card fica anexado ao fim do <body>
 * (fora da ordem de documento do parágrafo) por precisar de position:fixed
 * clampado na viewport.
 */
export default function TermPreview({ articleRef, contentKey }) {
  const activeAnchorRef = useRef(null);
  const pinnedRef = useRef(false);
  // marca o focusin que nós mesmos provocamos ao devolver o foco no fechamento
  const fechandoRef = useRef(false);

  useEffect(() => {
    const mascaras = mapaDeMascaras();
    const root = articleRef?.current;
    if (!root) return undefined;

    const pop = document.createElement('div');
    pop.className = 'term-preview-popover';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Prévia do verbete');
    pop.hidden = true;
    document.body.appendChild(pop);

    let hideTimer = null;
    let closeBtn = null;
    let linkEl = null;

    function clearHideTimer() {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    }

    function hide() {
      clearHideTimer();
      pop.hidden = true;
      pop.classList.remove('is-visible');
      pinnedRef.current = false;
      activeAnchorRef.current = null;
      closeBtn = null;
      linkEl = null;
    }

    /* ⚠️ Devolver o foco ao termo dispara `focusin`, e `focusin` mostra o card.
       No desktop isso passava batido porque o clique do mouse já tinha deixado
       o link focado, então o focus() não mudava nada. No celular o toque NÃO
       foca o link: o focus() era uma mudança real, o focusin disparava e o card
       reabria no mesmo quadro — o X parecia não funcionar (só "fechava" pelo
       clique fora, que não devolve foco). A flag ignora esse focusin. */
    function hideAndReturnFocus() {
      const anchor = activeAnchorRef.current;
      hide();
      if (!anchor) return;
      fechandoRef.current = true;
      anchor.focus();
      setTimeout(() => { fechandoRef.current = false; }, 0);
    }

    function scheduleHide(delay = 150) {
      if (pinnedRef.current) return;
      clearHideTimer();
      hideTimer = setTimeout(() => {
        if (!pop.matches(':hover')) hide();
      }, delay);
    }

    function escapeHtml(s) {
      return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    function position(anchor) {
      const margin = 10;
      const rect = anchor.getBoundingClientRect();

      pop.style.visibility = 'hidden';
      pop.hidden = false;
      const popRect = pop.getBoundingClientRect();

      let left = rect.left + rect.width / 2 - popRect.width / 2;
      left = Math.max(margin, Math.min(left, window.innerWidth - popRect.width - margin));

      let top = rect.bottom + 8;
      let placement = 'bottom';
      if (top + popRect.height > window.innerHeight - margin) {
        const above = rect.top - popRect.height - 8;
        if (above >= margin) {
          top = above;
          placement = 'top';
        } else {
          // não cabe nem embaixo nem em cima com folga — cola no topo da viewport
          top = margin;
          placement = 'bottom';
        }
      }

      pop.style.left = `${left}px`;
      pop.style.top = `${top}px`;
      pop.dataset.placement = placement;
      pop.style.visibility = 'visible';
    }

    function show(anchor, { pinned = false } = {}) {
      clearHideTimer();
      // um card firmado nunca é rebaixado por hover/foco, nem no mesmo termo:
      // com a checagem antiga, o Shift+Tab do botão fechar voltava ao termo e
      // desfirmava o card que o usuário tinha aberto de propósito
      if (pinnedRef.current && !pinned) return;

      const title = anchor.dataset.termTitle || anchor.textContent;
      const short = anchor.dataset.termShort || '';
      const href = anchor.getAttribute('href');
      const masc = mascaras[anchor.dataset.termSlug] || null;
      pop.innerHTML = `
        <button type="button" class="term-preview-close" aria-label="Fechar prévia">&times;</button>
        ${masc ? `<span class="term-preview-mascara" style="background:${masc.fundo}"><img src="${BASE_PATH}/raposa/mascara/${masc.id}.webp" alt="" width="40" height="47"></span>` : ''}
        <p class="term-preview-title">${escapeHtml(title)}</p>
        ${short ? `<p class="term-preview-short">${escapeHtml(short)}</p>` : ''}
        <a class="term-preview-link" href="${href}" target="_blank" rel="noopener noreferrer">
          Ver verbete completo
          <span class="term-preview-link-icon" aria-hidden="true">↗</span>
          <span class="sr-only"> (abre em nova aba)</span>
        </a>
      `;
      closeBtn = pop.querySelector('.term-preview-close');
      linkEl = pop.querySelector('.term-preview-link');
      closeBtn.addEventListener('click', hideAndReturnFocus);
      closeBtn.addEventListener('keydown', onCloseBtnKeyDown);

      activeAnchorRef.current = anchor;
      pinnedRef.current = pinned;
      position(anchor);
      pop.classList.add('is-visible');
    }

    /**
     * ⚠️ DELEGAÇÃO, não listener por âncora. Não voltar atrás nisso.
     *
     * O corpo do post entra por dangerouslySetInnerHTML, e depois da
     * hidratação o useSitedata relê o post do localStorage: o HTML é
     * recalculado e o React SUBSTITUI os nós do DOM. Listeners presos às
     * âncoras antigas morrem com elas, e o efeito não roda de novo porque
     * contentKey (post.id) continua o mesmo — resultado: o clique voltava a
     * navegar e o card nunca abria (bug de 2026-07-30, reproduzido em
     * navegador antes do conserto).
     *
     * Delegando no container, qualquer âncora que apareça depois já funciona.
     * Por isso também usamos mouseover/mouseout e focusin/focusout, que
     * borbulham, em vez de mouseenter/focus, que não borbulham.
     */
    const hoverCapable = window.matchMedia && window.matchMedia('(hover: hover)').matches;

    const termFrom = (e) => {
      const el = e.target instanceof Element ? e.target.closest('a.term-link') : null;
      return el && root.contains(el) ? el : null;
    };

    function onRootOver(e) {
      const anchor = termFrom(e);
      if (!anchor) return;
      // mouseover borbulha e dispara de novo ao mover dentro do mesmo link;
      // ignorar quando o card já está nesse termo evita reposicionar à toa
      if (activeAnchorRef.current === anchor && !pop.hidden) return;
      show(anchor, { pinned: false });
    }
    function onRootOut(e) {
      const anchor = termFrom(e);
      if (!anchor) return;
      // saiu pra dentro do próprio card: não esconde
      const next = e.relatedTarget;
      if (next instanceof Node && pop.contains(next)) return;
      scheduleHide();
    }
    function onRootFocusIn(e) {
      const anchor = termFrom(e);
      if (!anchor) return;
      if (fechandoRef.current) return; // foco devolvido pelo fechamento: não reabrir
      // foco por teclado (Tab) chegando no termo: mostra como prévia, igual
      // ao hover — só firma de verdade se o usuário ativar (Enter -> click)
      show(anchor, { pinned: false });
    }
    function onRootFocusOut(e) {
      const anchor = termFrom(e);
      if (!anchor) return;
      if (pinnedRef.current) return;
      const next = e.relatedTarget;
      if (next instanceof Node && pop.contains(next)) return;
      scheduleHide(120);
    }
    function onRootClick(e) {
      const anchor = termFrom(e);
      if (!anchor) return;
      // Ctrl/Cmd/Shift+clique ou botão do meio: deixa o navegador tratar a
      // abertura em nova aba/janela normalmente, sem interceptar.
      if (e.button === 1 || e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();
      show(anchor, { pinned: true });
    }
    function onRootKeyDown(e) {
      const anchor = termFrom(e);
      if (!anchor) return;
      if (e.key === 'Tab' && !e.shiftKey && activeAnchorRef.current === anchor && !pop.hidden) {
        // entra no card em vez de pular pro próximo elemento da página
        e.preventDefault();
        (closeBtn || linkEl)?.focus();
      }
    }
    function onCloseBtnKeyDown(e) {
      if (e.key === 'Tab' && e.shiftKey) {
        // volta o foco pro termo em vez de sair do card por trás
        e.preventDefault();
        activeAnchorRef.current?.focus();
      }
    }

    // hover só é ligado em dispositivos capazes de :hover — em touch, alguns
    // navegadores emitem mouseover/mouseout "fantasmas" depois do toque, o
    // que bagunçaria o estado firmado do card.
    if (hoverCapable) {
      root.addEventListener('mouseover', onRootOver);
      root.addEventListener('mouseout', onRootOut);
    }
    root.addEventListener('focusin', onRootFocusIn);
    root.addEventListener('focusout', onRootFocusOut);
    root.addEventListener('click', onRootClick);
    root.addEventListener('keydown', onRootKeyDown);

    pop.addEventListener('mouseenter', clearHideTimer);
    pop.addEventListener('mouseleave', () => scheduleHide(80));

    function onKeyDown(e) {
      if (e.key === 'Escape' && !pop.hidden) {
        hideAndReturnFocus();
      }
    }
    function onDismissScroll() {
      if (!pop.hidden) hide();
    }
    function onOutsideClick(e) {
      if (pop.hidden) return;
      if (pop.contains(e.target)) return;
      // clique num termo (qualquer um, inclusive os que entraram no DOM
      // depois) não conta como "clique fora" — quem trata é onRootClick
      if (e.target instanceof Element && e.target.closest('a.term-link')) return;
      hide();
    }

    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onDismissScroll, { passive: true, capture: true });
    window.addEventListener('resize', onDismissScroll);
    document.addEventListener('click', onOutsideClick, true);

    return () => {
      if (hoverCapable) {
        root.removeEventListener('mouseover', onRootOver);
        root.removeEventListener('mouseout', onRootOut);
      }
      root.removeEventListener('focusin', onRootFocusIn);
      root.removeEventListener('focusout', onRootFocusOut);
      root.removeEventListener('click', onRootClick);
      root.removeEventListener('keydown', onRootKeyDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onDismissScroll, { capture: true });
      window.removeEventListener('resize', onDismissScroll);
      document.removeEventListener('click', onOutsideClick, true);
      pop.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleRef, contentKey]);

  return null;
}
