'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * ListenButton — le o texto em voz alta usando window.speechSynthesis.
 *
 * Lida com as pegadinhas do mobile:
 *  - Chrome Android trava utterances com mais de ~200 chars → quebra em chunks.
 *  - Chrome pausa a sintese apos ~15s inativo → keep-alive com pause/resume.
 *  - iOS Safari so carrega vozes depois do primeiro speak → warm-up.
 *  - voiceschanged pode disparar tardiamente → re-aplica voz em cada chunk.
 *
 * Player: play/pause, parar, velocidade (0.75x–2x, persistida), barra de busca
 * arrastavel (toque e mouse) e pular 15s pra tras/frente. Como a Web Speech API
 * nao expoe posicao de audio, a linha do tempo e estimada por caracteres:
 * cada chunk vira um intervalo, e o seek reinicia a fala no chunk correspondente.
 *
 * ⚠ Regra de ouro daqui: synth.cancel() e ASSINCRONO. O utterance cancelado
 * ainda dispara onend/onerror depois, e esses handlers avancavam o indice e
 * chamavam speak() de novo — resultado: duas falas concorrentes, pulos pra
 * frente e retrocessos aleatorios a cada clique. Por isso toda interrupcao
 * incrementa `epochRef`; handlers de uma epoca vencida sao ignorados, e os
 * callbacks do utterance antigo sao desligados antes do cancel.
 */

// chars por segundo de fala em pt-BR a 1x — calibrado por ouvido, serve pra estimar tempo
const CHARS_PER_SECOND = 14.5;
const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];
const SKIP_SECONDS = 15;
const RATE_STORAGE_KEY = 'raposa:listen-rate';
// ~150 chars a 1x ≈ 10s de fala: abaixo do ponto em que o Chrome engasga
const MAX_CHUNK_LEN = 150;

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

export default function ListenButton({ text, title, label = 'Ouvir', audioSrc = null }) {
  // Quando existe mp3 narrado com a voz dele (gerado por scripts/narrar_posts.py),
  // ele ganha do speechSynthesis: voz real, posição real, seek real. O componente de
  // voz sintética abaixo continua inteiro, como plano B para post sem áudio.
  // ⚠️ Começa em `false` de propósito: o player da voz do navegador aparece IMEDIATAMENTE.
  // Segurar a renderização até o fetch responder deixava a página sem botão nenhum
  // sempre que a resposta demorasse ou o host não respondesse ao HEAD (foi assim que
  // os 9 testes do player quebraram de uma vez).
  const [temArquivo, setTemArquivo] = useState(false);

  useEffect(() => {
    if (!audioSrc) return undefined;
    let vivo = true;
    // HEAD é barato e não baixa o mp3; 404 aqui é o caso normal do post sem narração
    fetch(audioSrc, { method: 'HEAD' })
      .then((r) => { if (vivo && r.ok) setTemArquivo(true); })
      .catch(() => {});
    return () => { vivo = false; };
  }, [audioSrc]);

  if (temArquivo) return <AudioPlayer src={audioSrc} label={label} />;
  return <SpeechPlayer text={text} title={title} label={label} />;
}

/** Player do mp3 narrado: o <audio> nativo já dá tempo e busca de verdade. */
function AudioPlayer({ src, label }) {
  const ref = useRef(null);
  const [tocando, setTocando] = useState(false);
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    try {
      const saved = parseFloat(window.localStorage.getItem(RATE_STORAGE_KEY));
      if (SPEEDS.includes(saved)) setRate(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.playbackRate = rate;
  }, [rate]);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) { a.play(); setTocando(true); } else { a.pause(); setTocando(false); }
  };

  const skip = (segundos) => {
    const a = ref.current;
    if (a) a.currentTime = Math.max(0, Math.min(a.currentTime + segundos, a.duration || 0));
  };

  const trocaVelocidade = () => {
    const next = SPEEDS[(SPEEDS.indexOf(rate) + 1) % SPEEDS.length];
    setRate(next);
    try { window.localStorage.setItem(RATE_STORAGE_KEY, String(next)); } catch {}
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border-[1.5px] border-linha bg-bg-card px-4 py-3">
      <audio
        ref={ref}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setPos(e.currentTarget.currentTime)}
        onEnded={() => setTocando(false)}
      />
      <div className="flex items-center gap-2">
        <button onClick={() => skip(-SKIP_SECONDS)} aria-label={`Voltar ${SKIP_SECONDS} segundos`}
          className="p-2 text-text-dim hover:text-accent transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 4 12l7 7" /><path d="M20 5l-7 7 7 7" />
          </svg>
        </button>
        <button onClick={toggle} aria-label={tocando ? 'Pausar' : `${label} com a voz do autor`}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-mata text-[var(--washi)] hover:bg-[var(--cedro)] transition-colors">
          {tocando ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>
        <button onClick={() => skip(SKIP_SECONDS)} aria-label={`Avançar ${SKIP_SECONDS} segundos`}
          className="p-2 text-text-dim hover:text-accent transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 5l7 7-7 7" /><path d="M4 5l7 7-7 7" />
          </svg>
        </button>
        <span className="ml-1 font-sans text-[13px] text-text-dim tabular-nums">
          {formatTime(pos)} / {formatTime(dur)}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="font-sans text-[12px] font-semibold tracking-[0.12em] uppercase text-accent">voz do autor</span>
          <button onClick={trocaVelocidade} aria-label={`Velocidade ${rate}x`}
            className="min-w-[3rem] px-2.5 py-2 rounded-full border border-linha text-text hover:text-accent hover:border-[var(--acento)] font-sans text-[13px] font-semibold transition-colors tabular-nums">
            {rate}x
          </button>
        </div>
      </div>
      <div className="relative mt-3 h-6 flex items-center">
        <div className="absolute left-0 right-0 h-[4px] rounded-full bg-linha" />
        <div className="absolute left-0 h-[4px] rounded-full bg-torii pointer-events-none"
          style={{ width: `${dur ? (pos / dur) * 100 : 0}%` }} />
        <input
          type="range" min={0} max={Math.max(dur, 0.1)} step={0.1} value={pos}
          onChange={(e) => { const v = Number(e.target.value); setPos(v); if (ref.current) ref.current.currentTime = v; }}
          aria-label="Posição da narração"
          className="listen-seek absolute left-0 right-0 w-full appearance-none bg-transparent cursor-pointer"
        />
      </div>
    </div>
  );
}

function SpeechPlayer({ text, title, label = 'Ouvir' }) {
  const [state, setState] = useState('idle'); // idle | playing | paused
  const [supported, setSupported] = useState(false);
  const [rate, setRate] = useState(1);
  const [charsDone, setCharsDone] = useState(0); // posicao estimada, em caracteres
  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  // Refs espelham o estado porque os handlers da Web Speech API sobrevivem ao
  // render que os criou — ler o state ali devolveria valor velho.
  const stateRef = useRef('idle');
  const charsRef = useRef(0);
  const rateRef = useRef(1);
  const epochRef = useRef(0);
  const utterRef = useRef(null);
  const chunkIndexRef = useRef(0);
  const keepAliveRef = useRef(null);
  const tickRef = useRef(null);
  const chunkStartedAtRef = useRef(0); // timestamp do inicio do chunk atual
  const pausedAccRef = useRef(0); // tempo acumulado em pausa dentro do chunk
  const pauseBeganRef = useRef(0);
  const seekingRef = useRef(false);
  const seekValueRef = useRef(0);

  const setPos = useCallback((value) => {
    charsRef.current = value;
    setCharsDone(value);
  }, []);

  const setPlayerState = useCallback((value) => {
    stateRef.current = value;
    setState(value);
  }, []);

  // Quebra o texto em pedacos pequenos pra contornar o limite do Chrome Android.
  // Prefere quebrar em sentencas; se ainda for grande, quebra em virgulas; ultimo recurso: hard split.
  const chunks = useMemo(() => {
    const full = [title, text].filter(Boolean).join('. ');
    const maxLen = MAX_CHUNK_LEN;
    if (!full) return [];
    const sentences = full
      .replace(/\s+/g, ' ')
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean);

    const out = [];
    let buf = '';
    for (const s of sentences) {
      if (s.length > maxLen) {
        if (buf) { out.push(buf); buf = ''; }
        // sentenca gigante: quebra em virgulas
        const parts = s.split(/,\s*/);
        let sub = '';
        for (const p of parts) {
          if ((sub + ', ' + p).length > maxLen && sub) { out.push(sub); sub = p; }
          else sub = sub ? `${sub}, ${p}` : p;
        }
        if (sub) {
          if (sub.length > maxLen) {
            // ainda gigante: split duro
            for (let i = 0; i < sub.length; i += maxLen) {
              out.push(sub.slice(i, i + maxLen));
            }
          } else out.push(sub);
        }
      } else if ((buf + ' ' + s).length > maxLen && buf) {
        out.push(buf);
        buf = s;
      } else {
        buf = buf ? `${buf} ${s}` : s;
      }
    }
    if (buf) out.push(buf);
    return out;
  }, [text, title]);

  // offsets[i] = quantos caracteres existem antes do chunk i; ultimo item = total
  const offsets = useMemo(() => {
    const acc = [0];
    for (const c of chunks) acc.push(acc[acc.length - 1] + c.length);
    return acc;
  }, [chunks]);

  const totalChars = offsets[offsets.length - 1] || 0;
  const totalSeconds = totalChars / (CHARS_PER_SECOND * rate);
  const currentChars = seeking ? seekValue : charsDone;
  const elapsedSeconds = currentChars / (CHARS_PER_SECOND * rate);
  const percent = totalChars ? Math.min(100, (currentChars / totalChars) * 100) : 0;

  // ── temporizadores ───────────────────────────────────────────────────────
  const stopKeepAlive = useCallback(() => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }, []);

  const startKeepAlive = useCallback(() => {
    if (keepAliveRef.current) return;
    // Chrome Android pausa speech depois de ~15s: pulso a cada 8s mantem vivo.
    // So pulsa se o player acredita estar tocando — senao o resume() ressuscita
    // uma fala que o usuario acabou de pausar.
    keepAliveRef.current = setInterval(() => {
      const synth = window.speechSynthesis;
      if (!synth || stateRef.current !== 'playing') return;
      if (synth.speaking && !synth.paused) {
        synth.pause();
        synth.resume();
      }
    }, 8000);
  }, []);

  const stopTicker = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  // Interpola a posicao dentro do chunk atual pelo tempo decorrido — onboundary
  // nao dispara em todos os navegadores, entao o relogio e a fonte confiavel.
  const startTicker = useCallback(() => {
    if (tickRef.current) return;
    tickRef.current = setInterval(() => {
      if (stateRef.current !== 'playing' || seekingRef.current) return;
      const i = chunkIndexRef.current;
      const chunk = chunks[i];
      if (!chunk || !chunkStartedAtRef.current) return;
      const spentMs = Date.now() - chunkStartedAtRef.current - pausedAccRef.current;
      const chunkSeconds = chunk.length / (CHARS_PER_SECOND * rateRef.current);
      const frac = Math.max(0, Math.min(1, spentMs / 1000 / Math.max(chunkSeconds, 0.001)));
      const next = offsets[i] + chunk.length * frac;
      // a estimativa so anda pra frente: nunca deixa a barra recuar sozinha
      if (next > charsRef.current) setPos(next);
    }, 200);
  }, [chunks, offsets, setPos]);

  // ── nucleo da fala ───────────────────────────────────────────────────────
  const getVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang === 'pt-BR' && /Google|Microsoft|Luciana|Felipe/i.test(v.name)) ||
      voices.find((v) => v.lang === 'pt-BR') ||
      voices.find((v) => v.lang?.startsWith('pt')) ||
      voices[0]
    );
  };

  /**
   * Interrompe tudo e abre uma nova epoca. Devolve o numero da epoca: quem for
   * falar depois precisa provar que ainda esta nela.
   */
  const hardCancel = useCallback(() => {
    epochRef.current += 1;
    const dead = utterRef.current;
    if (dead) {
      // desliga antes do cancel: o utterance morto ainda emite onend/onerror
      dead.onstart = null;
      dead.onend = null;
      dead.onerror = null;
      dead.onboundary = null;
      utterRef.current = null;
    }
    const synth = window.speechSynthesis;
    try { synth.cancel(); } catch {}
    // cancel() com o synth pausado deixa a flag paused presa no Chrome, e a
    // proxima utterance nunca comeca — resume() com a fila vazia e inofensivo
    try { synth.resume(); } catch {}
    stopTicker();
    chunkStartedAtRef.current = 0;
    pausedAccRef.current = 0;
    pauseBeganRef.current = 0;
    return epochRef.current;
  }, [stopTicker]);

  const finish = useCallback(() => {
    stopKeepAlive();
    stopTicker();
    utterRef.current = null;
    setPos(totalChars);
    setPlayerState('idle');
  }, [setPos, setPlayerState, stopKeepAlive, stopTicker, totalChars]);

  const speakChunk = useCallback((index, epoch) => {
    if (epoch !== epochRef.current) return; // epoca vencida: outro clique mandou
    if (index >= chunks.length) { finish(); return; }

    chunkIndexRef.current = index;
    const u = new SpeechSynthesisUtterance(chunks[index]);
    u.lang = 'pt-BR';
    u.rate = rateRef.current;
    u.pitch = 1.0;
    const v = getVoice();
    if (v) u.voice = v;

    u.onstart = () => {
      if (epoch !== epochRef.current) return;
      chunkStartedAtRef.current = Date.now();
      pausedAccRef.current = 0;
      startKeepAlive();
      startTicker();
    };
    u.onboundary = (e) => {
      if (epoch !== epochRef.current || seekingRef.current) return;
      if (typeof e?.charIndex === 'number') {
        const next = offsets[index] + Math.min(e.charIndex, chunks[index].length);
        if (next > charsRef.current) setPos(next);
      }
    };
    u.onend = () => {
      if (epoch !== epochRef.current) return;
      setPos(offsets[index + 1] ?? totalChars);
      speakChunk(index + 1, epoch);
    };
    u.onerror = (e) => {
      // "interrupted"/"canceled" sao normais quando o usuario para ou busca
      const err = e?.error;
      if (epoch !== epochRef.current || err === 'interrupted' || err === 'canceled') return;
      if (err) console.warn('[ListenButton] erro:', err);
      setPos(offsets[index + 1] ?? totalChars);
      speakChunk(index + 1, epoch);
    };

    utterRef.current = u;
    window.speechSynthesis.speak(u);
  }, [chunks, offsets, totalChars, finish, setPos, startKeepAlive, startTicker]);

  /** Recomeca a fala num chunk. Unico caminho usado por play, seek, skip e velocidade. */
  const playFromChunk = useCallback((index) => {
    if (chunks.length === 0) return;
    const clamped = Math.max(0, Math.min(index, chunks.length - 1));
    const epoch = hardCancel();
    setPos(offsets[clamped]);
    setPlayerState('playing');
    // deixa o cancel drenar a fila antes de falar de novo (Chrome engasga sem isso)
    setTimeout(() => speakChunk(clamped, epoch), 80);
  }, [chunks.length, hardCancel, offsets, setPos, setPlayerState, speakChunk]);

  const chunkAtChar = useCallback((charPos) => {
    for (let i = chunks.length - 1; i >= 0; i -= 1) {
      if (charPos >= offsets[i]) return i;
    }
    return 0;
  }, [chunks.length, offsets]);

  // ── ciclo de vida ────────────────────────────────────────────────────────
  useEffect(() => {
    const has = typeof window !== 'undefined' && 'speechSynthesis' in window;
    setSupported(has);
    if (has) {
      // warm-up: acorda o synthesizer no iOS (getVoices volta vazio sem isso)
      try { window.speechSynthesis.getVoices(); } catch {}
      try {
        const saved = parseFloat(window.localStorage.getItem(RATE_STORAGE_KEY));
        if (SPEEDS.includes(saved)) { setRate(saved); rateRef.current = saved; }
      } catch {}
    }
    return () => {
      epochRef.current += 1;
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (keepAliveRef.current) clearInterval(keepAliveRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
      keepAliveRef.current = null;
      tickRef.current = null;
    };
  }, []);

  // A sintese e global ao navegador: sair da aba com a leitura rolando deixaria
  // a voz solta. Ao voltar, o Chrome as vezes acorda pausado — normaliza.
  useEffect(() => {
    if (!supported) return undefined;
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && stateRef.current === 'playing') {
        try { window.speechSynthesis.resume(); } catch {}
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [supported]);

  // ── comandos ─────────────────────────────────────────────────────────────
  const start = () => {
    if (!supported || chunks.length === 0) return;
    const synth = window.speechSynthesis;
    const epoch = hardCancel();
    setPos(0);
    setPlayerState('playing'); // feedback imediato: o painel abre no clique

    const kickoff = () => speakChunk(0, epoch);
    if (synth.getVoices().length > 0) {
      kickoff();
      return;
    }
    // vozes ainda nao carregaram (iOS frio): espera o evento, com rede de seguranca
    let fired = false;
    const kick = () => {
      if (fired) return;
      fired = true;
      synth.removeEventListener('voiceschanged', kick);
      kickoff();
    };
    synth.addEventListener('voiceschanged', kick);
    setTimeout(kick, 500);
  };

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (stateRef.current === 'idle') return start();
    if (stateRef.current === 'playing') {
      setPlayerState('paused'); // antes do pause(): trava o keep-alive na hora
      stopTicker();
      pauseBeganRef.current = Date.now();
      try { synth.pause(); } catch {}
      return;
    }
    // retomando
    if (pauseBeganRef.current) {
      pausedAccRef.current += Date.now() - pauseBeganRef.current;
      pauseBeganRef.current = 0;
    }
    setPlayerState('playing');
    try { synth.resume(); } catch {}
    startKeepAlive();
    startTicker();
    // Safari/iOS as vezes ignora o resume() e a fala nunca volta: se em 400ms
    // nada estiver falando, refaz o chunk atual do zero.
    setTimeout(() => {
      if (stateRef.current !== 'playing') return;
      const s = window.speechSynthesis;
      if (!s.speaking || s.paused) playFromChunk(chunkIndexRef.current);
    }, 400);
  };

  const stop = () => {
    hardCancel();
    stopKeepAlive();
    chunkIndexRef.current = 0;
    setPos(0);
    setPlayerState('idle');
  };

  const changeRate = () => {
    const next = SPEEDS[(SPEEDS.indexOf(rate) + 1) % SPEEDS.length];
    setRate(next);
    rateRef.current = next;
    try { window.localStorage.setItem(RATE_STORAGE_KEY, String(next)); } catch {}
    // a rate de uma utterance ja iniciada e imutavel: refaz o chunk atual na
    // nova velocidade, retomando de onde a estimativa parou
    if (stateRef.current !== 'idle') playFromChunk(chunkAtChar(charsRef.current));
  };

  const skip = (seconds) => {
    if (stateRef.current === 'idle') return;
    const delta = seconds * CHARS_PER_SECOND * rateRef.current;
    const target = Math.max(0, Math.min(charsRef.current + delta, Math.max(totalChars - 1, 0)));
    playFromChunk(chunkAtChar(target));
  };

  const beginSeek = () => {
    seekingRef.current = true;
    setSeeking(true);
  };

  const commitSeek = useCallback(() => {
    if (!seekingRef.current) return;
    seekingRef.current = false;
    setSeeking(false);
    playFromChunk(chunkAtChar(seekValueRef.current));
  }, [chunkAtChar, playFromChunk]);

  // Soltar o dedo/mouse fora da barra tambem precisa concluir a busca — senao o
  // player fica preso em "arrastando" e o tempo congela.
  useEffect(() => {
    if (!seeking) return undefined;
    const end = () => commitSeek();
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, [seeking, commitSeek]);

  if (!supported || chunks.length === 0) {
    return null;
  }

  const isActive = state !== 'idle';

  if (!isActive) {
    return (
      <button
        onClick={start}
        aria-label="Ouvir leitura"
        className="inline-flex items-center gap-2 h-10 px-4 rounded-full border-[1.5px] border-linha bg-bg-card text-text-bright font-sans text-[14px] font-semibold hover:border-[var(--acento)] hover:text-accent transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10v4a1 1 0 001 1h3l4 4V5L7 9H4a1 1 0 00-1 1z" />
          <path d="M15.54 8.46a5 5 0 010 7.07" />
          <path d="M19.07 4.93a10 10 0 010 14.14" />
        </svg>
        <span>{label}</span>
      </button>
    );
  }

  return (
    <div className="w-full max-w-xl rounded-2xl border-[1.5px] border-linha bg-bg-card px-4 py-3">
      {/* linha 1 — transporte */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => skip(-SKIP_SECONDS)}
          aria-label={`Voltar ${SKIP_SECONDS} segundos`}
          className="p-2 text-text-dim hover:text-accent transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 4 12l7 7" />
            <path d="M20 5l-7 7 7 7" />
          </svg>
        </button>

        <button
          onClick={toggle}
          aria-label={state === 'playing' ? 'Pausar leitura' : 'Continuar leitura'}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-mata text-[var(--washi)] hover:bg-[var(--cedro)] transition-colors"
        >
          {state === 'playing' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={() => skip(SKIP_SECONDS)}
          aria-label={`Avançar ${SKIP_SECONDS} segundos`}
          className="p-2 text-text-dim hover:text-accent transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 5l7 7-7 7" />
            <path d="M4 5l7 7-7 7" />
          </svg>
        </button>

        <span className="ml-1 font-sans text-[13px] text-text-dim tabular-nums">
          {formatTime(elapsedSeconds)} / {formatTime(totalSeconds)}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={changeRate}
            aria-label={`Velocidade ${rate}x — tocar para mudar`}
            className="min-w-[3rem] px-2.5 py-2 rounded-full border border-linha text-text hover:text-accent hover:border-[var(--acento)] font-sans text-[13px] font-semibold transition-colors tabular-nums"
          >
            {rate}x
          </button>
          <button
            onClick={stop}
            aria-label="Parar leitura"
            className="p-2 text-text-dim hover:text-accent transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* linha 2 — barra de busca */}
      <div className="relative mt-3 h-6 flex items-center">
        <div className="absolute left-0 right-0 h-[4px] rounded-full bg-linha" />
        <div
          className="absolute left-0 h-[4px] rounded-full bg-torii pointer-events-none"
          style={{ width: `${percent}%` }}
        />
        <input
          type="range"
          min={0}
          max={Math.max(totalChars - 1, 1)}
          step={1}
          value={Math.round(currentChars)}
          onPointerDown={beginSeek}
          onChange={(e) => {
            const v = Number(e.target.value);
            seekValueRef.current = v;
            setSeekValue(v);
            // teclado e clique direto na trilha nao passam por pointerdown
            if (!seekingRef.current) beginSeek();
          }}
          onKeyUp={commitSeek}
          onBlur={commitSeek}
          aria-label="Posição da leitura"
          aria-valuetext={`${formatTime(elapsedSeconds)} de ${formatTime(totalSeconds)}`}
          className="listen-seek absolute left-0 right-0 w-full appearance-none bg-transparent cursor-pointer"
        />
      </div>
    </div>
  );
}
