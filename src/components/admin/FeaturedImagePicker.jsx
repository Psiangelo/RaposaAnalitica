'use client';
import { resolveImageSrc } from '@/lib/basepath';

import { useRef, useState } from 'react';

/**
 * FeaturedImagePicker — escolhe imagem de capa por upload ou URL.
 * Upload local: lê o file, comprime via canvas (max 1600px width),
 * exporta JPEG 82% e salva como base64 no state do post.
 * Não usa backend — o base64 vai pro localStorage junto do post.
 */
export default function FeaturedImagePicker({ value, alt, onChange, onAltChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('upload'); // upload | url

  const compress = (file) =>
    new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Arquivo não é imagem'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const maxW = 1600;
          const scale = Math.min(1, maxW / img.width);
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          try {
            const data = canvas.toDataURL('image/jpeg', 0.82);
            resolve(data);
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = () => reject(new Error('Falha ao decodificar imagem'));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
      reader.readAsDataURL(file);
    });

  const handleFile = async (file) => {
    setError('');
    setBusy(true);
    try {
      const data = await compress(file);
      const kb = Math.round((data.length * 0.75) / 1024);
      if (kb > 1024) {
        setError(`Imagem comprimida em ${kb}KB — acima do recomendado (1MB). Considere usar uma imagem menor.`);
      }
      onChange(data);
    } catch (e) {
      setError(e.message || 'Erro ao processar imagem');
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    onChange('');
    onAltChange?.('');
    setError('');
  };

  const sizeLabel = value && value.startsWith('data:')
    ? `${Math.round((value.length * 0.75) / 1024)} KB`
    : value
    ? 'URL externa'
    : '';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-2 py-1 rounded ${
            mode === 'upload'
              ? 'bg-[rgb(var(--acento-rgb)/0.2)] text-[rgb(var(--acento-rgb))]'
              : 'text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--acento-rgb))]'
          }`}
        >
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`px-2 py-1 rounded ${
            mode === 'url'
              ? 'bg-[rgb(var(--acento-rgb)/0.2)] text-[rgb(var(--acento-rgb))]'
              : 'text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--acento-rgb))]'
          }`}
        >
          URL
        </button>
        {sizeLabel && (
          <span className="ml-auto text-[9px] text-[rgb(var(--texto-dim-rgb))]">{sizeLabel}</span>
        )}
      </div>

      {value ? (
        <div className="relative aspect-video rounded-lg overflow-hidden border border-[rgb(var(--acento-rgb)/0.2)] group">
          <img
            src={resolveImageSrc(value)}
            alt={alt || ''}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <button
            type="button"
            onClick={clear}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/75 hover:bg-red-900/80 text-white text-sm flex items-center justify-center transition-colors opacity-80 group-hover:opacity-100 shadow-lg"
            aria-label="Remover imagem"
          >
            ✕
          </button>
        </div>
      ) : mode === 'upload' ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          disabled={busy}
          className="w-full aspect-video rounded-lg border-2 border-dashed border-[rgb(var(--acento-rgb)/0.2)] hover:border-[rgb(var(--acento-rgb)/0.6)] hover:bg-[rgb(var(--acento-rgb)/0.04)] transition-all flex flex-col items-center justify-center gap-2 text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--acento-rgb))] disabled:opacity-50"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3v13M6 9l6-6 6 6M4 21h16" />
          </svg>
          <span className="text-xs font-sans">
            {busy ? 'Processando…' : 'Clique ou arraste uma imagem'}
          </span>
          <span className="text-[10px] font-mono text-[rgb(var(--texto-dim-rgb)/0.7)] tracking-wider">
            Será comprimida pra 1600px · JPEG
          </span>
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://... (cole URL externa)"
            value={value.startsWith('data:') ? '' : value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-[rgb(var(--fundo-rgb))] border border-[rgb(var(--acento-rgb)/0.15)] focus:border-[rgb(var(--acento-rgb))] outline-none text-[rgb(var(--texto-forte-rgb))] text-xs font-sans rounded px-3 py-2"
          />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
        className="hidden"
      />

      {value && (
        <input
          value={alt || ''}
          onChange={(e) => onAltChange?.(e.target.value)}
          placeholder="Texto alternativo (alt) — acessibilidade"
          className="w-full bg-[rgb(var(--fundo-rgb))] border border-[rgb(var(--acento-rgb)/0.15)] focus:border-[rgb(var(--acento-rgb))] outline-none text-[rgb(var(--texto-forte-rgb))] text-xs font-sans rounded px-3 py-2"
        />
      )}

      {error && (
        <p className="text-[11px] text-amber-300/90 font-sans italic">{error}</p>
      )}
    </div>
  );
}
