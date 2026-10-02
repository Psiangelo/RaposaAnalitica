'use client';

import { useEffect, useState } from 'react';
import { publicarNaNuvem } from '@/lib/publicarNuvem';
import { chavesEditadas, nomeDa } from '@/lib/conteudoNuvem';
import { supabase } from '@/lib/supabase';
import { CARD, BTN } from '@/components/admin/ui';

/**
 * Publicar: grava no banco da Raposa o que foi editado neste navegador.
 * O visitante vê na hora; as páginas fixas se reconstroem em alguns minutos.
 */
export default function PublishManager({ addToast, addLogEntry }) {
  const [editadas, setEditadas] = useState([]);
  const [email, setEmail] = useState('');
  const [etapa, setEtapa] = useState('');
  const [publicando, setPublicando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const conferir = () => setEditadas(chavesEditadas());
  useEffect(() => {
    conferir();
    supabase().auth.getUser().then(({ data }) => setEmail(data?.user?.email || ''));
    const h = () => conferir();
    window.addEventListener('sitedata:changed', h);
    window.addEventListener('storage', h);
    return () => {
      window.removeEventListener('sitedata:changed', h);
      window.removeEventListener('storage', h);
    };
  }, []);

  const publicar = async () => {
    setPublicando(true);
    setResultado(null);
    try {
      const r = await publicarNaNuvem({ progresso: setEtapa });
      setResultado(r);
      conferir();
      addToast?.(r.chaves ? 'Publicado. Quem abrir o site já vê.' : 'Nada novo para publicar.', 'success');
      if (r.chaves) addLogEntry?.('Publicado', `${r.chaves} parte(s)${r.imagens ? `, ${r.imagens} imagem(ns)` : ''}`);
    } catch (e) {
      addToast?.(`Não deu para publicar: ${e.message}`, 'error');
    } finally {
      setPublicando(false);
      setEtapa('');
    }
  };

  const nomes = Array.from(new Set(editadas.map(nomeDa)));

  return (
    <div className="max-w-3xl space-y-5">
      <div className={CARD}>
        <p className="font-serif text-[1.3rem] text-[rgb(var(--texto-forte-rgb))]">
          {nomes.length ? 'Pronto para publicar' : 'Tudo publicado'}
        </p>
        {nomes.length ? (
          <>
            <p className="mt-1 font-sans text-[14px] text-[rgb(var(--texto-dim-rgb))]">Você mexeu em:</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {nomes.map((n) => (
                <li key={n} className="rounded-full bg-[rgb(var(--acento-rgb)/0.1)] px-3 py-1 font-sans text-[13px] text-[rgb(var(--texto-forte-rgb))]">{n}</li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-1 font-sans text-[14px] text-[rgb(var(--texto-dim-rgb))]">O que está neste navegador é igual ao que está no site.</p>
        )}
        <button onClick={publicar} disabled={publicando || !nomes.length} className={`${BTN} mt-5`}>
          {publicando ? `${etapa || 'Publicando'}…` : 'Publicar'}
        </button>
        {resultado?.chaves > 0 && (
          <p className="mt-3 font-sans text-[14px] text-[rgb(var(--texto-rgb))]">
            Publicado: {resultado.chaves} parte(s){resultado.imagens ? ` e ${resultado.imagens} imagem(ns)` : ''}.
          </p>
        )}
      </div>

      <div className={CARD}>
        <p className="font-serif text-[1.15rem] text-[rgb(var(--texto-forte-rgb))]">Como funciona</p>
        <ul className="mt-2 space-y-1.5 font-sans text-[14px] leading-relaxed text-[rgb(var(--texto-rgb))] list-disc pl-5">
          <li>O que você edita fica guardado neste navegador até apertar Publicar.</li>
          <li>Publicar grava no banco de dados do site. Quem abrir o site depois disso já vê a mudança.</li>
          <li>As páginas que o Google lê se refazem sozinhas em até uns 15 minutos.</li>
          <li>Cada versão anterior fica guardada no banco: dá para voltar atrás se algo der errado.</li>
        </ul>
        {email && <p className="mt-3 font-sans text-[13px] text-[rgb(var(--texto-dim-rgb))]">Você está como {email}.</p>}
      </div>
    </div>
  );
}
