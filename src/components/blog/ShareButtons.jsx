'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ShareButtons({ title }) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') setUrl(window.location.href);
  }, []);

  const encoded = {
    url: encodeURIComponent(url),
    title: encodeURIComponent(title || ''),
  };

  const flashToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2200);
  };

  const copy = async (successMsg = 'Link copiado') => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback iOS antigo / contexto não-seguro
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      flashToast(successMsg);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      flashToast('Não foi possível copiar');
    }
  };

  // Instagram não tem link de compartilhamento pela web — copia o link
  // e orienta a pessoa a colar no story/bio.
  const shareInstagram = () => copy('Link copiado — cole no story ou na bio do Instagram');

  const items = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encoded.title}%20${encoded.url}`,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      ),
    },
    {
      label: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?text=${encoded.title}&url=${encoded.url}`,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: 'Threads',
      href: `https://www.threads.net/intent/post?text=${encoded.title}%20${encoded.url}`,
      icon: (
        <svg width="14" height="14" viewBox="0 0 192 192" fill="currentColor">
          <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.688 136.834 117.144 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.617 174.908 97.0135 175.057C74.1888 174.89 56.9436 167.575 45.7679 153.317C35.2965 139.966 29.8823 120.682 29.6913 96C29.8823 71.3178 35.2965 52.0336 45.7679 38.6827C56.9436 24.4249 74.1885 17.11 97.0132 16.9435C119.998 17.1112 137.541 24.4614 149.162 38.788C154.858 45.8136 159.148 54.6488 161.986 64.9604L178.242 60.6188C174.786 47.9946 169.365 37.0964 161.965 27.9812C147.036 9.60158 125.202 0.180231 97.0132 0H96.9868C68.8532 0.180231 47.2557 9.63857 32.7981 28.319C19.9666 44.9004 13.3477 68.0176 13.1226 95.9331V96V96.0669C13.3477 123.982 19.9666 147.1 32.7981 163.681C47.2557 182.361 68.8532 191.82 96.9868 192H97.0132C121.958 191.831 139.734 185.317 154.036 170.882C172.740 152.026 172.171 128.462 165.965 114.328C161.560 104.294 153.106 96.1655 141.537 88.9883ZM98.4253 129.507C88.0402 130.108 77.2487 125.428 76.7181 115.386C76.3239 107.94 82.0355 99.6182 99.0389 98.5966C100.972 98.4808 102.87 98.4247 104.737 98.4247C111.061 98.4247 116.973 99.0704 122.348 100.308C120.348 125.396 108.729 128.947 98.4253 129.507Z" />
        </svg>
      ),
    },
    {
      label: 'Instagram',
      onClick: shareInstagram,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-sans text-[12px] font-semibold tracking-[0.12em] uppercase text-text-dim mr-1.5">
          Compartilhar
        </span>
        {items.map((it) =>
          it.onClick ? (
            <button
              key={it.label}
              onClick={it.onClick}
              aria-label={`Compartilhar no ${it.label}`}
              title={it.label}
              className="w-10 h-10 inline-flex items-center justify-center rounded-full border-[1.5px] border-linha bg-bg-card text-text-bright hover:border-[var(--acento)] hover:text-accent transition-colors"
            >
              {it.icon}
            </button>
          ) : (
            <a
              key={it.label}
              href={it.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Compartilhar no ${it.label}`}
              className="w-10 h-10 inline-flex items-center justify-center rounded-full border-[1.5px] border-linha bg-bg-card text-text-bright hover:border-[var(--acento)] hover:text-accent transition-colors"
              title={it.label}
            >
              {it.icon}
            </a>
          )
        )}
        <button
          onClick={() => copy()}
          aria-label="Copiar link"
          title="Copiar link"
          className="w-10 h-10 inline-flex items-center justify-center rounded-full border-[1.5px] border-linha bg-bg-card text-text-bright hover:border-[var(--acento)] hover:text-accent transition-colors"
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          )}
        </button>
      </div>

      {/* Toast flutuante — feedback visual pro mobile onde o tick some facil */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed left-1/2 -translate-x-1/2 bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] z-[200] pointer-events-none"
      >
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              className="bg-mata text-[var(--washi)] font-sans text-[14px] font-semibold px-4 py-2.5 rounded-full shadow-lg"
            >
              {toastMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
