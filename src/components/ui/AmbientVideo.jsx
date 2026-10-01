'use client';

import { useEffect, useRef, useState } from 'react';
import { img } from '@/lib/basepath';

/**
 * AmbientVideo — footage de fundo, decorativo, sem áudio e sem controles.
 *
 * Regras que ele garante sozinho:
 * - o poster aparece na hora; o mp4 só é anexado quando a seção chega perto da
 *   viewport (IntersectionObserver), então nenhuma faixa fora da dobra baixa
 *   vídeo em quem não rolou até lá;
 * - `prefers-reduced-motion` e o Save-Data do navegador cancelam o vídeo por
 *   completo, fica só o poster;
 * - o basePath do GitHub Pages entra pelo img(), como no resto do site.
 *
 * O scrim NÃO vem daqui: cada seção desenha o seu, porque o gradiente depende
 * de onde o texto cai.
 */
export default function AmbientVideo({
  src,
  poster,
  className = '',
  opacity = 0.55,
  eager = false,
  objectPosition = 'center',
}) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  // null enquanto não decidimos; string = arquivo a tocar
  const [videoSrc, setVideoSrc] = useState(null);

  useEffect(() => {
    // Só poster quando pediram menos movimento ou estão economizando dados.
    // A decisão fica aqui dentro do efeito de propósito: assim o <video> nunca
    // chega a entrar no DOM nesses casos.
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection?.saveData;
    if (reduce || saveData) return;

    // Mesmo arquivo em todas as telas. Houve uma versão reduzida pra celular e
    // ela ficou visivelmente pior: nessas cenas escuras o que aparece primeiro
    // ao cortar bitrate é banding, não perda de nitidez.
    const chosen = src;
    if (!chosen) return;

    if (eager) {
      setVideoSrc(chosen);
      return;
    }

    const el = wrapRef.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setVideoSrc(chosen);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVideoSrc(chosen);
          io.disconnect();
        }
      },
      { rootMargin: '300px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager, src]);

  // Alguns navegadores ignoram o autoPlay quando o src entra depois do mount
  useEffect(() => {
    if (!videoSrc) return;
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p?.catch) p.catch(() => {});
  }, [videoSrc]);

  const posterSrc = poster ? img(poster) : undefined;

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ opacity }}
    >
      {posterSrc && (
        <img
          src={posterSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition }}
        />
      )}
      {videoSrc && (
        <video
          ref={videoRef}
          src={img(videoSrc)}
          poster={posterSrc}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          tabIndex={-1}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition }}
        />
      )}
    </div>
  );
}
