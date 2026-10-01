'use client';

/**
 * BlogPostBody — renderiza o HTML do post + injeta cartografias via shortcode.
 *
 * Suporta `[[carto:slug]]` em qualquer ponto do body. No render, isso é
 * substituído por um placeholder div; após o mount, percorremos os
 * placeholders e montamos um <CartographyView /> em cada via React.createRoot.
 */

import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import CartographyView from '@/components/cartography/CartographyView';

const SHORTCODE_PATTERN = /\[\[carto:([a-z0-9-]+)\]\]/gi;

function preprocessHtml(html) {
  if (typeof html !== 'string') return '';
  return html.replace(SHORTCODE_PATTERN, (_, slug) => {
    return `<div class="carto-embed-placeholder my-8" data-carto-slug="${slug}"></div>`;
  });
}

export default function BlogPostBody({ html, className = 'blog-content blog-post-body' }) {
  const ref = useRef(null);
  const rootsRef = useRef([]);

  const processed = preprocessHtml(html);

  useEffect(() => {
    if (!ref.current) return undefined;

    // Limpa montagens anteriores (em caso de re-render)
    rootsRef.current.forEach((r) => { try { r.unmount(); } catch {} });
    rootsRef.current = [];

    const placeholders = ref.current.querySelectorAll('.carto-embed-placeholder[data-carto-slug]');
    placeholders.forEach((el) => {
      const slug = el.getAttribute('data-carto-slug');
      if (!slug) return;
      el.innerHTML = '';
      const root = createRoot(el);
      root.render(<CartographyView slug={slug} compact />);
      rootsRef.current.push(root);
    });

    return () => {
      rootsRef.current.forEach((r) => { try { r.unmount(); } catch {} });
      rootsRef.current = [];
    };
  }, [processed]);

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
}
