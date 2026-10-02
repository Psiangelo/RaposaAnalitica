'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import ContentManager from '@/components/admin/ContentManager';
import BioManager from '@/components/admin/BioManager';
import VisibilityManager from '@/components/admin/VisibilityManager';
import LabelsManager from '@/components/admin/LabelsManager';
import SectionOrderManager from '@/components/admin/SectionOrderManager';
import PublishManager from '@/components/admin/PublishManager';
import UnpublishedBanner from '@/components/admin/UnpublishedBanner';
import AdminSidebar from '@/components/admin/AdminSidebar';
import GlossarioManager from '@/components/admin/GlossarioManager';
import ServicosManager from '@/components/admin/ServicosManager';
import LojaManager from '@/components/admin/LojaManager';
import CartasManager from '@/components/admin/CartasManager';
import TagEstilosManager from '@/components/admin/TagEstilosManager';
import InscritosManager from '@/components/admin/InscritosManager';
import { Mascarinha } from '@/components/raposa/Marca';
import Icone from '@/components/raposa/Icone';
import {
  getSettings, setSettings, DEFAULT_SETTINGS, getBlogPosts, getGlossario, getTrilhas, getLoja, getServicos,
  SITEDATA_KEYS,
} from '@/lib/sitedata';
import { CHAVES_PUBLICAVEIS, baixarNovidades, nomeDa } from '@/lib/conteudoNuvem';
import { supabase } from '@/lib/supabase';
import { BASE_PATH } from '@/lib/site';
import { CARD, INPUT, LABEL, BTN, BTN2, BTN_PERIGO, Campo, Texto, Area } from '@/components/admin/ui';

const Carregando = () => (
  <div className="py-10 text-center font-sans text-[13px] text-[rgb(var(--texto-dim-rgb))]">Carregando…</div>
);
const BlogManager = dynamic(() => import('@/components/admin/BlogManager'), { ssr: false, loading: Carregando });
const TrilhasManager = dynamic(() => import('@/components/admin/TrilhasManager'), { ssr: false, loading: Carregando });
const CartographyManager = dynamic(() => import('@/components/admin/CartographyManager'), { ssr: false, loading: Carregando });

/* ------------------------------------------------------------------ chaves locais
   Nada aqui começa com raposa_admin_: nada disso é publicado. O login é o
   da Supabase (sessão em raposa_sessao, ver src/lib/supabase.js). */
const LOG_KEY = 'raposa_painel_atividade';

/** A conta logada é de administrador? (lê a própria linha em administradores) */
async function ehAdmin() {
  const sb = supabase();
  const { data } = await sb.auth.getUser();
  const user = data?.user;
  if (!user) return false;
  const { data: linha } = await sb.from('administradores').select('user_id').eq('user_id', user.id).maybeSingle();
  return !!linha;
}

function ler(k, padrao) {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : padrao;
  } catch {
    return padrao;
  }
}

/* ------------------------------------------------------------------ toasts e registro */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);
  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id));
  return { toasts, addToast, remove };
}

function Toasts({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            onClick={() => remove(t.id)}
            className={`pointer-events-auto text-left px-4 py-3 rounded-xl shadow-lg max-w-sm font-sans text-[14px] border ${
              t.type === 'success'
                ? 'bg-[var(--mata)] text-[var(--washi)] border-transparent'
                : t.type === 'error'
                  ? 'bg-[var(--urushi)] text-[var(--washi)] border-transparent'
                  : 'bg-[rgb(var(--cartao-rgb))] text-[rgb(var(--texto-forte-rgb))] border-[rgb(var(--linha-rgb))]'
            }`}
          >
            {t.message}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

function useRegistro() {
  const [log, setLog] = useState([]);
  useEffect(() => setLog(ler(LOG_KEY, [])), []);
  const add = useCallback((acao, detalhe) => {
    setLog((prev) => {
      const novo = [{ quando: Date.now(), acao, detalhe }, ...prev].slice(0, 30);
      try { localStorage.setItem(LOG_KEY, JSON.stringify(novo)); } catch { /* noop */ }
      return novo;
    });
  }, []);
  const limpar = useCallback(() => {
    setLog([]);
    try { localStorage.removeItem(LOG_KEY); } catch { /* noop */ }
  }, []);
  return { log, add, limpar };
}

/* ------------------------------------------------------------------ entrada */
function Moldura({ subtitulo, children, rodape }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[rgb(var(--fundo-rgb))]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-7">
          <Mascarinha tamanho={84} className="mx-auto" />
          <h1 className="mt-4 font-serif text-[2rem] font-bold text-[rgb(var(--texto-forte-rgb))]">Painel da Raposa</h1>
          <p className="mt-1 font-sans text-[14px] text-[rgb(var(--texto-dim-rgb))]">{subtitulo}</p>
        </div>
        {children}
        {rodape && <p className="mt-5 text-center font-sans text-[13px] leading-relaxed text-[rgb(var(--texto-dim-rgb))]">{rodape}</p>}
      </motion.div>
    </div>
  );
}

function Entrada({ onEntrar }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [indo, setIndo] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setErro('');
    setAviso('');
    setIndo(true);
    try {
      const { error } = await supabase().auth.signInWithPassword({ email: email.trim(), password: senha });
      if (error) {
        setErro(/invalid login/i.test(error.message) ? 'E-mail ou senha errados.' : `Não deu para entrar: ${error.message}`);
        return;
      }
      if (!(await ehAdmin())) {
        await supabase().auth.signOut();
        setErro('Esta conta não tem acesso ao painel.');
        return;
      }
      onEntrar();
    } finally {
      setIndo(false);
    }
  };

  const esqueci = async () => {
    setErro('');
    setAviso('');
    if (!email.trim()) return setErro('Escreva o seu e-mail primeiro.');
    const { error } = await supabase().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}${BASE_PATH}/admin/`,
    });
    if (error) setErro(`Não deu para mandar o e-mail: ${error.message}`);
    else setAviso('Se o e-mail for o do painel, chega uma mensagem com um link para criar uma senha nova.');
  };

  return (
    <Moldura subtitulo="Entre com o seu e-mail e a sua senha." rodape="Só a conta de administrador entra. O que você edita aqui vai para o banco do site quando aperta Publicar.">
      <form onSubmit={enviar} className={`${CARD} p-6 sm:p-7`}>
        <label className={LABEL}>E-mail</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus autoComplete="username" className={INPUT} />
        <label className={`${LABEL} mt-4`}>Senha</label>
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" className={INPUT} />
        {erro && <p className="mt-3 font-sans text-[14px] text-[rgb(var(--rubedo-rgb))]">{erro}</p>}
        {aviso && <p className="mt-3 font-sans text-[14px] text-[rgb(var(--texto-rgb))]">{aviso}</p>}
        <button type="submit" disabled={indo} className={`${BTN} w-full justify-center mt-5 py-3 text-[15px]`}>{indo ? 'Entrando…' : 'Entrar'}</button>
        <button type="button" onClick={esqueci} className="mt-3 w-full font-sans text-[13px] text-[rgb(var(--texto-dim-rgb))] underline underline-offset-2">
          Esqueci a senha
        </button>
      </form>
    </Moldura>
  );
}

/** Depois do link de «esqueci a senha»: criar a senha nova. */
function NovaSenha({ onPronto }) {
  const [senha, setSenha] = useState('');
  const [senha2, setSenha2] = useState('');
  const [erro, setErro] = useState('');
  const enviar = async (e) => {
    e.preventDefault();
    setErro('');
    if (senha.length < 8) return setErro('Use pelo menos 8 caracteres.');
    if (senha !== senha2) return setErro('As duas senhas não batem.');
    const { error } = await supabase().auth.updateUser({ password: senha });
    if (error) return setErro(`Não deu para trocar: ${error.message}`);
    onPronto();
  };
  return (
    <Moldura subtitulo="Crie a sua senha nova.">
      <form onSubmit={enviar} className={`${CARD} p-6 sm:p-7`}>
        <label className={LABEL}>Senha nova</label>
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoFocus autoComplete="new-password" className={INPUT} />
        <label className={`${LABEL} mt-4`}>Repita a senha</label>
        <input type="password" value={senha2} onChange={(e) => setSenha2(e.target.value)} autoComplete="new-password" className={INPUT} />
        {erro && <p className="mt-3 font-sans text-[14px] text-[rgb(var(--rubedo-rgb))]">{erro}</p>}
        <button type="submit" className={`${BTN} w-full justify-center mt-5 py-3 text-[15px]`}>Salvar e entrar</button>
      </form>
    </Moldura>
  );
}

/* ------------------------------------------------------------------ painel inicial */
function PainelInicial({ irPara, log }) {
  const [n, setN] = useState({ ensaios: 0, rascunhos: 0, verbetes: 0, trilhas: 0, produtos: 0, pecas: 0 });
  useEffect(() => {
    const posts = getBlogPosts();
    setN({
      ensaios: posts.filter((p) => p.status === 'published').length,
      rascunhos: posts.filter((p) => p.status !== 'published').length,
      verbetes: getGlossario().length,
      trilhas: getTrilhas().length,
      produtos: getLoja().produtos.length,
      pecas: getServicos().pecas.length,
    });
  }, []);
  const cartoes = [
    { rotulo: 'Ensaios publicados', valor: n.ensaios, extra: n.rascunhos ? `${n.rascunhos} rascunho(s)` : '', aba: 'blog', icone: 'pincel' },
    { rotulo: 'Verbetes', valor: n.verbetes, aba: 'glossario', icone: 'mascara' },
    { rotulo: 'Trilhas', valor: n.trilhas, aba: 'trilhas', icone: 'torii' },
    { rotulo: 'Produtos na loja', valor: n.produtos, aba: 'loja', icone: 'sacola' },
    { rotulo: 'Níveis de pesquisa', valor: n.pecas, aba: 'servicos', icone: 'lupa' },
  ];
  return (
    <div className="max-w-5xl">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {cartoes.map((c) => (
          <button key={c.rotulo} onClick={() => irPara(c.aba)} className={`${CARD} text-left hover:border-[rgb(var(--acento-rgb))] transition-colors`}>
            <Icone nome={c.icone} size={20} className="text-[rgb(var(--acento-rgb))]" />
            <p className="mt-2 font-serif text-[2rem] leading-none text-[rgb(var(--texto-forte-rgb))]">{c.valor}</p>
            <p className="mt-1 font-sans text-[13px] text-[rgb(var(--texto-dim-rgb))]">{c.rotulo}</p>
            {c.extra && <p className="font-sans text-[12px] text-[rgb(var(--rubedo-rgb))]">{c.extra}</p>}
          </button>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className={CARD}>
          <p className="font-serif text-[1.2rem] text-[rgb(var(--texto-forte-rgb))] mb-3">Atalhos</p>
          <div className="flex flex-wrap gap-2">
            <button className={BTN2} onClick={() => irPara('blog')}>Escrever ensaio</button>
            <button className={BTN2} onClick={() => irPara('glossario')}>Novo verbete</button>
            <button className={BTN2} onClick={() => irPara('loja')}>Novo produto</button>
            <button className={BTN2} onClick={() => irPara('content')}>Textos da home</button>
            <button className={BTN2} onClick={() => irPara('publish')}>Publicar</button>
            <Link className={BTN2} href="/" target="_blank">Ver o site ↗</Link>
          </div>
        </div>
        <div className={CARD}>
          <p className="font-serif text-[1.2rem] text-[rgb(var(--texto-forte-rgb))] mb-3">O que foi feito por aqui</p>
          {log.length === 0 ? (
            <p className="font-sans text-[14px] text-[rgb(var(--texto-dim-rgb))]">Nada ainda.</p>
          ) : (
            <ul className="space-y-1.5 max-h-64 overflow-y-auto">
              {log.slice(0, 12).map((l) => (
                <li key={l.quando} className="font-sans text-[13.5px] text-[rgb(var(--texto-rgb))]">
                  <span className="text-[rgb(var(--texto-dim-rgb))]">{new Date(l.quando).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span> · <b>{l.acao}</b> {l.detalhe}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ configurações */
function Configuracoes({ addToast, addLog }) {
  const [s, setS] = useState(DEFAULT_SETTINGS);
  const [sujo, setSujo] = useState(false);
  const [nova, setNova] = useState('');
  useEffect(() => setS(getSettings()), []);
  const muda = (k, v) => {
    setS((x) => ({ ...x, [k]: v }));
    setSujo(true);
  };
  const salvar = () => {
    setSettings(s);
    setSujo(false);
    addToast('Configurações salvas. Lembre de publicar.', 'success');
    addLog('Configurações', 'contatos e textos');
  };
  const trocarSenha = async () => {
    if (nova.length < 8) return addToast('A senha nova precisa de 8 caracteres ou mais.', 'error');
    const { error } = await supabase().auth.updateUser({ password: nova });
    if (error) return addToast(`Não deu para trocar: ${error.message}`, 'error');
    setNova('');
    addToast('Senha trocada. Use a nova da próxima vez que entrar.', 'success');
    addLog('Senha', 'trocada');
  };
  return (
    <div className="max-w-3xl space-y-6">
      <div className={`${CARD} grid sm:grid-cols-2 gap-4`}>
        <Campo label="WhatsApp (só números, com DDI e DDD)"><Texto value={s.whatsappNumber} onChange={(v) => muda('whatsappNumber', v)} /></Campo>
        <Campo label="Instagram (link)"><Texto value={s.instagramLink} onChange={(v) => muda('instagramLink', v)} /></Campo>
        <Campo label="Mensagem padrão do WhatsApp" className="sm:col-span-2"><Area value={s.whatsappMessage} onChange={(v) => muda('whatsappMessage', v)} rows={2} /></Campo>
        <Campo label="E-mail (opcional)"><Texto value={s.emailAddress} onChange={(v) => muda('emailAddress', v)} /></Campo>
        <Campo label="YouTube (opcional)"><Texto value={s.youtubeLink} onChange={(v) => muda('youtubeLink', v)} /></Campo>
        <div className="sm:col-span-2 flex justify-end">
          <button onClick={salvar} disabled={!sujo} className={BTN}>Salvar</button>
        </div>
      </div>
      <div className={CARD}>
        <p className={LABEL}>Sua senha do painel</p>
        <div className="flex gap-2">
          <input type="password" value={nova} onChange={(e) => setNova(e.target.value)} placeholder="nova senha" className={INPUT} />
          <button onClick={trocarSenha} className={BTN2}>Trocar</button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ backup */
function Backup({ addToast, limparLog }) {
  const exportar = () => {
    const data = {};
    for (const k of CHAVES_PUBLICAVEIS) {
      const raw = localStorage.getItem(k);
      if (raw != null) {
        try { data[k] = JSON.parse(raw); } catch { /* noop */ }
      }
    }
    const blob = new Blob([JSON.stringify({ exportadoEm: new Date().toISOString(), data }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `raposa-analitica-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    addToast('Backup baixado.', 'success');
  };
  const importar = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const j = JSON.parse(r.result);
        const data = j.data || j;
        let n = 0;
        for (const k of CHAVES_PUBLICAVEIS) {
          if (Object.prototype.hasOwnProperty.call(data, k)) {
            localStorage.setItem(k, JSON.stringify(data[k]));
            n++;
          }
        }
        window.dispatchEvent(new CustomEvent('sitedata:changed', { detail: {} }));
        addToast(`${n} partes restauradas. Confira e publique.`, 'success');
      } catch {
        addToast('Esse arquivo não é um backup válido.', 'error');
      }
    };
    r.readAsText(f);
    e.target.value = '';
  };
  return (
    <div className="max-w-3xl space-y-4">
      <div className={CARD}>
        <p className="font-serif text-[1.2rem] text-[rgb(var(--texto-forte-rgb))]">Baixar uma cópia de tudo</p>
        <p className="mt-1 mb-3 font-sans text-[14px] text-[rgb(var(--texto-dim-rgb))]">Ensaios, verbetes, trilhas, loja, textos: um arquivo JSON para guardar.</p>
        <button onClick={exportar} className={BTN}>Baixar backup</button>
      </div>
      <div className={CARD}>
        <p className="font-serif text-[1.2rem] text-[rgb(var(--texto-forte-rgb))]">Restaurar de um backup</p>
        <p className="mt-1 mb-3 font-sans text-[14px] text-[rgb(var(--texto-dim-rgb))]">Substitui o que está neste navegador pelo conteúdo do arquivo. Só vai ao site depois de publicar.</p>
        <input type="file" accept="application/json" onChange={importar} className="font-sans text-[14px]" />
      </div>
      <div className={CARD}>
        <p className="font-serif text-[1.2rem] text-[rgb(var(--texto-forte-rgb))]">Limpar o registro de atividade</p>
        <button onClick={limparLog} className={`${BTN_PERIGO} mt-3`}>Limpar</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ o painel */
const ic = (nome) => function IconeAba({ size = 16 }) {
  return <Icone nome={nome} size={size} />;
};

const GRUPOS = [
  { id: 'geral', label: 'Visão geral', items: [{ id: 'dashboard', label: 'Painel', icon: ic('raposa') }] },
  {
    id: 'escrita',
    label: 'Escrita',
    items: [
      { id: 'blog', label: 'Ensaios', icon: ic('pincel') },
      { id: 'glossario', label: 'Verbetes', icon: ic('mascara') },
      { id: 'trilhas', label: 'Trilhas', icon: ic('torii') },
      { id: 'tags', label: 'Estilo das tags', icon: ic('onda') },
      { id: 'cartography', label: 'Cartografia', icon: ic('caminho') },
    ],
  },
  {
    id: 'negocio',
    label: 'Negócio',
    items: [
      { id: 'servicos', label: 'Pesquisa', icon: ic('lupa') },
      { id: 'loja', label: 'Loja', icon: ic('sacola') },
      { id: 'cartas', label: 'Cartas (newsletter)', icon: ic('carta') },
      { id: 'inscritos', label: 'Inscritos nas Cartas', icon: ic('email') },
    ],
  },
  {
    id: 'paginas',
    label: 'Páginas',
    items: [
      { id: 'content', label: 'Textos da home', icon: ic('ema') },
      { id: 'sectionOrder', label: 'Ordem da home', icon: ic('leque') },
      { id: 'bio', label: 'Bio e autor', icon: ic('raposa') },
      { id: 'labels', label: 'Nomes do menu', icon: ic('pergaminho') },
      { id: 'visibility', label: 'O que aparece', icon: ic('olho') },
    ],
  },
  {
    id: 'sistema',
    label: 'Publicação',
    items: [
      { id: 'publish', label: 'Publicar', icon: ic('selo') },
      { id: 'settings', label: 'Configurações', icon: ic('chave') },
      { id: 'backup', label: 'Backup', icon: ic('livro') },
    ],
  },
];

function NavCelular({ ativa, setAtiva }) {
  const [aberto, setAberto] = useState(false);
  const todos = GRUPOS.flatMap((g) => g.items);
  const principais = ['dashboard', 'blog', 'content', 'publish'].map((id) => todos.find((t) => t.id === id));
  return (
    <>
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-[100] bg-[rgb(var(--fundo-rgb)/0.97)] border-t border-[rgb(var(--linha-rgb))] flex justify-around px-1 py-1 safe-bottom">
        {principais.map((t) => {
          const I = t.icon;
          return (
            <button key={t.id} onClick={() => setAtiva(t.id)} className={`flex flex-col items-center gap-0.5 px-2 py-1.5 flex-1 ${ativa === t.id ? 'text-[rgb(var(--acento-rgb))]' : 'text-[rgb(var(--texto-dim-rgb))]'}`}>
              <I size={20} />
              <span className="text-[11px] font-sans">{t.label}</span>
            </button>
          );
        })}
        <button onClick={() => setAberto(true)} className="flex flex-col items-center gap-0.5 px-2 py-1.5 flex-1 text-[rgb(var(--texto-dim-rgb))]">
          <Icone nome="menu" size={20} />
          <span className="text-[11px] font-sans">Mais</span>
        </button>
      </nav>
      <AnimatePresence>
        {aberto && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAberto(false)} className="sm:hidden fixed inset-0 bg-[rgb(19_33_31/0.5)] z-[110]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="sm:hidden fixed bottom-0 inset-x-0 z-[111] bg-[rgb(var(--cartao-rgb))] rounded-t-3xl max-h-[85vh] overflow-y-auto p-4">
              {GRUPOS.map((g) => (
                <div key={g.id} className="mb-4">
                  <p className="px-1 mb-2 text-[11px] uppercase tracking-[0.12em] font-semibold text-[rgb(var(--texto-dim-rgb))] font-sans">{g.label}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {g.items.map((t) => {
                      const I = t.icon;
                      return (
                        <button key={t.id} onClick={() => { setAtiva(t.id); setAberto(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-[13.5px] font-sans ${ativa === t.id ? 'border-[rgb(var(--acento-rgb))] text-[rgb(var(--acento-rgb))]' : 'border-[rgb(var(--linha-rgb))] text-[rgb(var(--texto-rgb))]'}`}>
                          <I size={17} /> {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Painel() {
  const [ativa, setAtiva] = useState('dashboard');
  const { toasts, addToast, remove } = useToast();
  const { log, add: addLog, limpar } = useRegistro();
  const meta = useMemo(() => GRUPOS.flatMap((g) => g.items.map((i) => ({ ...i, grupo: g.label }))).find((i) => i.id === ativa), [ativa]);

  useEffect(() => {
    const h = window.location.hash.replace('#', '');
    if (h && GRUPOS.some((g) => g.items.some((i) => i.id === h))) setAtiva(h);
  }, []);
  useEffect(() => {
    history.replaceState(null, '', `#${ativa}`);
    window.scrollTo({ top: 0 });
  }, [ativa]);
  useEffect(() => {
    baixarNovidades({
      aoPreservar: (ch) =>
        addToast(`Há uma versão mais nova no banco de: ${ch.map(nomeDa).join(', ')}. Mantive a sua edição deste aparelho; se publicar, ela vale.`, 'info'),
    })
      .then((ch) => ch.length && addToast(`Peguei do banco o que foi publicado de outro aparelho (${ch.length} parte(s)).`, 'info'))
      .catch(() => {});
  }, [addToast]);

  const sair = async () => {
    await supabase().auth.signOut();
    window.location.reload();
  };

  const props = { addToast, addLogEntry: addLog };

  return (
    <div className="min-h-screen bg-[rgb(var(--fundo-rgb))] pb-20 sm:pb-0">
      <Toasts toasts={toasts} remove={remove} />
      <header className="sticky top-0 z-50 h-[57px] bg-[rgb(var(--fundo-rgb)/0.95)] backdrop-blur border-b border-[rgb(var(--linha-rgb))]">
        <div className="max-w-[1400px] mx-auto h-full px-3 sm:px-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Mascarinha tamanho={34} />
            <p className="font-serif text-[1.05rem] font-bold text-[rgb(var(--texto-forte-rgb))]">Painel <span className="font-sans text-[12px] font-normal text-[rgb(var(--texto-dim-rgb))] ml-1">Raposa Analítica</span></p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank" className={BTN2}>Ver o site ↗</Link>
            <button onClick={sair} className="font-sans text-[13px] text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--rubedo-rgb))] px-2">Sair</button>
          </div>
        </div>
      </header>

      <UnpublishedBanner addToast={addToast} addLogEntry={addLog} onGoToPublish={() => setAtiva('publish')} />
      <NavCelular ativa={ativa} setAtiva={setAtiva} />

      <div className="sm:grid sm:grid-cols-[230px_1fr] max-w-[1400px] mx-auto">
        <AdminSidebar activeTab={ativa} setActiveTab={setAtiva} groups={GRUPOS} counts={{}} />
        <main className="px-3 sm:px-6 lg:px-8 py-5 sm:py-7 min-w-0">
          {meta && (
            <div className="mb-6 pb-4 border-b border-[rgb(var(--linha-rgb))]">
              <p className="font-sans text-[11px] uppercase tracking-[0.12em] font-semibold text-[rgb(var(--texto-dim-rgb))]">{meta.grupo}</p>
              <h1 className="font-serif text-[1.9rem] font-bold text-[rgb(var(--texto-forte-rgb))]">{meta.label}</h1>
            </div>
          )}
          {ativa === 'dashboard' && <PainelInicial irPara={setAtiva} log={log} />}
          {ativa === 'blog' && <BlogManager {...props} />}
          {ativa === 'glossario' && <GlossarioManager {...props} />}
          {ativa === 'trilhas' && <TrilhasManager {...props} />}
          {ativa === 'tags' && <TagEstilosManager {...props} />}
          {ativa === 'cartography' && <CartographyManager {...props} />}
          {ativa === 'servicos' && <ServicosManager {...props} />}
          {ativa === 'loja' && <LojaManager {...props} />}
          {ativa === 'cartas' && <CartasManager {...props} />}
          {ativa === 'inscritos' && <InscritosManager {...props} />}
          {ativa === 'content' && <ContentManager {...props} />}
          {ativa === 'sectionOrder' && <SectionOrderManager {...props} />}
          {ativa === 'bio' && <BioManager {...props} />}
          {ativa === 'labels' && <LabelsManager {...props} />}
          {ativa === 'visibility' && <VisibilityManager {...props} />}
          {ativa === 'publish' && <PublishManager {...props} />}
          {ativa === 'settings' && <Configuracoes addToast={addToast} addLog={addLog} />}
          {ativa === 'backup' && <Backup addToast={addToast} limparLog={limpar} />}
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [estado, setEstado] = useState('carregando'); // carregando | fora | dentro | nova-senha
  useEffect(() => {
    document.title = 'Painel · Raposa Analítica';
    const sb = supabase();
    const { data: escuta } = sb.auth.onAuthStateChange((evento) => {
      if (evento === 'PASSWORD_RECOVERY') setEstado('nova-senha');
    });
    (async () => {
      const { data } = await sb.auth.getSession();
      const dentro = data?.session ? await ehAdmin() : false;
      setEstado((e) => (e === 'nova-senha' ? e : dentro ? 'dentro' : 'fora'));
    })();
    return () => escuta?.subscription?.unsubscribe();
  }, []);
  if (estado === 'carregando') return <div className="min-h-screen bg-[rgb(var(--fundo-rgb))]" />;
  if (estado === 'nova-senha') return <NovaSenha onPronto={() => setEstado('dentro')} />;
  if (estado === 'fora') return <Entrada onEntrar={() => setEstado('dentro')} />;
  return <Painel />;
}
