'use client';
import { BASE_PATH } from '@/lib/site';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  getBio, setBio, DEFAULT_BIO,
  getSettings, setSettings, DEFAULT_SETTINGS,
  getSiteVisibility, setSiteVisibility, DEFAULT_VISIBILITY,
} from '@/lib/sitedata';
import { BIO_ICON_OPTIONS, BioCardIcon, hasBioIcon, inferBioIcon } from '@/components/bio/BioCardIcons';
import { BIO_ACCENTS } from '@/components/bio/BioAccents';

const INPUT = 'w-full bg-[rgb(var(--fundo-rgb))] border border-[rgb(var(--acento-rgb)/0.15)] focus:border-[rgb(var(--acento-rgb))] outline-none text-[rgb(var(--texto-forte-rgb))] text-sm font-sans rounded-lg px-3 py-2 transition-colors';
const TEXTAREA = INPUT + ' resize-y min-h-[80px]';
const LABEL = 'block text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans mb-2';
const CARD = 'bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--acento-rgb)/0.1)] rounded-xl p-4 sm:p-5';
const BTN_PRIMARY = 'px-4 py-2 bg-[rgb(var(--acento-rgb))] hover:bg-[rgb(var(--acento-forte-rgb))] text-[rgb(var(--fundo-rgb))] text-sm font-sans font-semibold rounded-lg transition-colors';
const BTN_SECONDARY = 'px-3 py-1.5 border border-[rgb(var(--acento-rgb)/0.2)] text-[rgb(var(--texto-rgb))] text-xs font-sans rounded-lg hover:border-[rgb(var(--acento-rgb))] hover:text-[rgb(var(--acento-rgb))] transition-colors';
const BTN_DANGER_INLINE = 'text-red-400/70 hover:text-red-400 text-xs px-2 py-1';

export default function BioManager({ addToast, addLogEntry }) {
  const [data, setData] = useState(DEFAULT_BIO);
  // Instagram (settings.instagramLink) e os liga/desliga dos botões dos blocos
  // de autor (visibility.autorInstagram / autorComoAtendo) não são dados do
  // Bio — vivem em `raposa_admin_settings` e `raposa_admin_visibility`
  // respectivamente (fonte única, usada por Configurações e Visibilidade).
  // Trazidos pra cá só como UI de conveniência: o card "Identidade de autor"
  // edita e salva os mesmos dados, sem duplicar onde ficam gravados.
  const [settingsData, setSettingsData] = useState(DEFAULT_SETTINGS);
  const [visibilityData, setVisibilityData] = useState(DEFAULT_VISIBILITY);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setData(getBio());
    setSettingsData(getSettings());
    setVisibilityData(getSiteVisibility());
  }, []);

  const updateSettingField = (key, value) => {
    setSettingsData((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const toggleVisibilityField = (key, value) => {
    setVisibilityData((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const update = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const updateImage = (idx, key, value) => {
    const images = [...data.images];
    images[idx] = { ...images[idx], [key]: value };
    setData({ ...data, images });
    setDirty(true);
  };

  const addImage = () => {
    const images = [...(data.images || []), { url: '', alt: '' }];
    setData({ ...data, images });
    setDirty(true);
  };

  const removeImage = (idx) => {
    const images = data.images.filter((_, i) => i !== idx);
    setData({ ...data, images });
    setDirty(true);
  };

  const moveImage = (idx, dir) => {
    const images = [...data.images];
    const target = idx + dir;
    if (target < 0 || target >= images.length) return;
    [images[idx], images[target]] = [images[target], images[idx]];
    setData({ ...data, images });
    setDirty(true);
  };

  const updateAuthor = (key, value) => {
    setData((prev) => ({
      ...prev,
      author: { ...(prev.author || DEFAULT_BIO.author), [key]: value },
    }));
    setDirty(true);
  };

  const updateAuthorPhoto = (key, value) => {
    setData((prev) => ({
      ...prev,
      author: {
        ...(prev.author || DEFAULT_BIO.author),
        photo: { ...(prev.author?.photo || DEFAULT_BIO.author.photo), [key]: value },
      },
    }));
    setDirty(true);
  };

  const updateLink = (idx, key, value) => {
    const links = [...data.links];
    links[idx] = { ...links[idx], [key]: value };
    setData({ ...data, links });
    setDirty(true);
  };

  const addLink = () => {
    const links = [...(data.links || []), { label: 'Novo link', href: '', image: '', icon: '', description: '' }];
    setData({ ...data, links });
    setDirty(true);
  };

  const removeLink = (idx) => {
    const links = data.links.filter((_, i) => i !== idx);
    setData({ ...data, links });
    setDirty(true);
  };

  const moveLink = (idx, dir) => {
    const links = [...data.links];
    const target = idx + dir;
    if (target < 0 || target >= links.length) return;
    [links[idx], links[target]] = [links[target], links[idx]];
    setData({ ...data, links });
    setDirty(true);
  };

  const resolveLinkImage = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith(BASE_PATH + '/')) return url;
    if (url.startsWith('/')) return `${BASE_PATH}${url}`;
    return url;
  };

  const persist = () => {
    setBio(data);
    setSettings(settingsData);
    setSiteVisibility(visibilityData);
    setDirty(false);
    addLogEntry?.('Bio/Linktree salva', `${data.images?.length || 0} imagens`);
    addToast?.('Bio salva', 'success');
  };

  const resetAll = () => {
    if (!confirm('Restaurar a Bio para o padrão? Suas edições serão perdidas.')) return;
    setData(DEFAULT_BIO);
    setDirty(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-serif text-[rgb(var(--texto-forte-rgb))]">Bio / Linktree</h2>
          <p className="text-xs text-[rgb(var(--texto-dim-rgb))] font-sans mt-1">
            Página mobile em /bio — compartilhe como cartão de visita digital
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <a
            href={`${BASE_PATH}/bio/`}
            target="_blank"
            rel="noopener noreferrer"
            className={BTN_SECONDARY}
          >
            Abrir /bio
          </a>
          <button onClick={resetAll} className={BTN_SECONDARY}>
            Restaurar padrão
          </button>
          <button
            onClick={persist}
            disabled={!dirty}
            className={BTN_PRIMARY + (dirty ? '' : ' opacity-40 cursor-not-allowed')}
          >
            Salvar
          </button>
        </div>
      </div>

      {/* Sticky save bar quando há mudanças */}
      {dirty && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-16 sm:bottom-4 z-40 bg-[rgb(var(--acento-rgb))] text-[rgb(var(--fundo-rgb))] rounded-lg shadow-lg shadow-black/40 flex items-center justify-between gap-3 px-4 py-3"
        >
          <span className="text-xs sm:text-sm font-sans font-semibold">
            Você tem mudanças não salvas
          </span>
          <button
            onClick={persist}
            className="px-4 py-1.5 bg-[rgb(var(--fundo-rgb))] text-[rgb(var(--acento-rgb))] text-xs font-sans font-semibold rounded tracking-wider uppercase"
          >
            Salvar agora
          </button>
        </motion.div>
      )}

      {/* Identidade */}
      <div className={CARD}>
        <h3 className="font-serif text-[rgb(var(--acento-rgb))] mb-4 text-sm uppercase tracking-widest">
          Identidade
        </h3>

        {/* Avatar */}
        <div className="mb-4">
          <label className={LABEL}>Foto de perfil (avatar)</label>
          <div className="flex items-start gap-3 flex-wrap">
            <div className="w-20 h-20 flex-shrink-0 rounded-full overflow-hidden border border-[rgb(var(--acento-rgb)/0.2)] bg-[rgb(var(--fundo-rgb))]">
              {data.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveLinkImage(data.avatar)}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[rgb(var(--texto-dim-rgb))] text-[10px]">
                  sem foto
                </div>
              )}
            </div>
            <div className="flex-1 min-w-[200px] space-y-2">
              <input
                type="text"
                value={data.avatar || ''}
                onChange={(e) => update('avatar', e.target.value)}
                className={INPUT}
                placeholder="/images/foto.jpg ou https://..."
              />
              <div className="flex gap-2 flex-wrap">
                <label className={BTN_SECONDARY + ' cursor-pointer'}>
                  Escolher arquivo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 800 * 1024) {
                        addToast?.('Imagem muito grande (max 800KB). Use URL externa.', 'error');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => update('avatar', reader.result);
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                {data.avatar && (
                  <button
                    onClick={() => update('avatar', '')}
                    className={BTN_DANGER_INLINE}
                  >
                    remover
                  </button>
                )}
              </div>
              <p className="text-[10px] text-[rgb(var(--texto-dim-rgb))]">
                Cole uma URL ou suba um arquivo (max 800KB). Arquivos são salvos embutidos no navegador.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Nome exibido</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => update('name', e.target.value)}
              className={INPUT}
              placeholder="Raposa Analítica"
            />
          </div>
          <div>
            <label className={LABEL}>Tagline (linha pequena abaixo do nome)</label>
            <input
              type="text"
              value={data.tagline}
              onChange={(e) => update('tagline', e.target.value)}
              className={INPUT}
              placeholder="Psicologia Analítica · Jung"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className={LABEL}>Bio curta (1-2 frases)</label>
          <textarea
            value={data.bio}
            onChange={(e) => update('bio', e.target.value)}
            className={TEXTAREA}
            rows={3}
            placeholder="Estudo psicologia e leio a obra de Jung..."
          />
        </div>
        <div className="mt-4">
          <AuthorToggle
            label="Último ensaio em destaque"
            hint="No alto dos links, com a capa: o ensaio fixado ou, sem fixado, o mais novo."
            checked={data.destaqueEnsaio !== false}
            onChange={(v) => update('destaqueEnsaio', v)}
          />
        </div>
      </div>

      {/* Identidade de autor — assinatura dos ensaios/estudos, não a marca do /bio */}
      <div className={CARD}>
        <h3 className="font-serif text-[rgb(var(--acento-rgb))] mb-1 text-sm uppercase tracking-widest">
          Identidade de autor
        </h3>
        <p className="text-[11px] text-[rgb(var(--texto-dim-rgb))] mb-4">
          Nome, foto e texto de quem escreve: aparecem na faixa «Quem escreve» no fim dos ensaios e
          das trilhas, na caixa de autor de cada ensaio, em /sobre, no rodapé (a frase de aviso) e no
          que o Google lê. Separado do nome e da foto da marca, acima, que são do cartão /bio.
        </p>

        {/* Foto do autor */}
        <div className="mb-4">
          <label className={LABEL}>Foto do autor</label>
          <div className="flex items-start gap-3 flex-wrap">
            <div className="w-20 h-20 flex-shrink-0 rounded-full overflow-hidden border border-[rgb(var(--acento-rgb)/0.2)] bg-[rgb(var(--fundo-rgb))]">
              {data.author?.photo?.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveLinkImage(data.author.photo.src)}
                  alt="foto do autor"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[rgb(var(--texto-dim-rgb))] text-[10px]">
                  sem foto
                </div>
              )}
            </div>
            <div className="flex-1 min-w-[200px] space-y-2">
              <input
                type="text"
                value={data.author?.photo?.src || ''}
                onChange={(e) => updateAuthorPhoto('src', e.target.value)}
                className={INPUT}
                placeholder="/images/foto.jpg ou https://..."
              />
              <div className="flex gap-2 flex-wrap">
                <label className={BTN_SECONDARY + ' cursor-pointer'}>
                  Escolher arquivo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 800 * 1024) {
                        addToast?.('Imagem muito grande (max 800KB). Use URL externa.', 'error');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => updateAuthorPhoto('src', reader.result);
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
              <input
                type="text"
                value={data.author?.photo?.alt || ''}
                onChange={(e) => updateAuthorPhoto('alt', e.target.value)}
                className={INPUT}
                placeholder="Texto alternativo (alt)"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Nome</label>
            <input
              type="text"
              value={data.author?.name || ''}
              onChange={(e) => updateAuthor('name', e.target.value)}
              className={INPUT}
              placeholder="Ângelo"
            />
          </div>
          <div>
            <label className={LABEL}>Credencial (linha abaixo do nome)</label>
            <input
              type="text"
              value={data.author?.credential || ''}
              onChange={(e) => updateAuthor('credential', e.target.value)}
              className={INPUT}
              placeholder="Estagiário em Psicologia · Associação Allos"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className={LABEL}>Bio de autor (quem escreve, com que autoridade)</label>
          <textarea
            value={data.author?.bio || ''}
            onChange={(e) => updateAuthor('bio', e.target.value)}
            className={TEXTAREA}
            rows={3}
            placeholder="Leio Jung faz um tempo, e aqui eu conto o que vou achando..."
          />
        </div>
        <div className="mt-4">
          <label className={LABEL}>Frase de aviso (rodapé, /sobre e quem escreve)</label>
          <textarea
            value={data.author?.disclaimer || ''}
            onChange={(e) => updateAuthor('disclaimer', e.target.value)}
            className={TEXTAREA}
            rows={2}
            placeholder="Não atendo nem dou diagnóstico por aqui."
          />
        </div>

        {/* Instagram — o dado mora em Configurações (raposa_admin_settings.instagramLink),
            usado também pelo Footer. Editar aqui grava lá mesmo, sem duplicar. */}
        <div className="mt-4">
          <label className={LABEL}>Link do Instagram (botão "Acompanhe" nos blocos de autor)</label>
          <input
            type="text"
            value={settingsData.instagramLink || ''}
            onChange={(e) => updateSettingField('instagramLink', e.target.value)}
            className={INPUT}
            placeholder="https://www.instagram.com/raposaanalitica/"
          />
          <p className="text-[10px] text-[rgb(var(--texto-dim-rgb))] mt-1">
            Mesmo campo de Admin → Configurações → Contato e Redes Sociais — muda nos dois lugares.
            Vazio, o botão de Instagram some.
          </p>
        </div>

        {/* Liga/desliga dos botões que aparecem junto com essa identidade —
            os dados vivem em Admin → Visibilidade, replicados aqui pra não
            precisar trocar de aba. */}
        <div className="mt-5 pt-4 border-t border-[rgb(var(--acento-rgb)/0.08)]">
          <label className={LABEL}>Botões nos blocos de autor</label>
          <div className="space-y-3">
            <AuthorToggle
              label="Botão do Instagram"
              hint="Na faixa «quem escreve», na caixa de autor dos ensaios e em /sobre. Some também se o link do Instagram (Configurações) estiver vazio."
              checked={!!visibilityData.autorInstagram}
              onChange={(v) => toggleVisibilityField('autorInstagram', v)}
            />
          </div>
        </div>
      </div>

      {/* Galeria */}
      <div className={CARD}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-serif text-[rgb(var(--acento-rgb))] text-sm uppercase tracking-widest">
              Galeria de imagens
            </h3>
            <p className="text-[11px] text-[rgb(var(--texto-dim-rgb))] mt-1">
              URLs de imagens (ex: <code className="text-[rgb(var(--acento-rgb))]">/images/foto.jpg</code> ou URL completa).
              Aparece em grid 2 colunas.
            </p>
          </div>
          <button onClick={addImage} className={BTN_SECONDARY}>
            + Adicionar imagem
          </button>
        </div>

        {(!data.images || data.images.length === 0) && (
          <p className="text-xs text-[rgb(var(--texto-dim-rgb))] italic text-center py-4">
            Nenhuma imagem ainda. Clique em "Adicionar imagem" para começar.
          </p>
        )}

        <div className="space-y-3">
          {data.images?.map((image, idx) => {
            const isHidden = !!image.hidden;
            return (
              <div
                key={idx}
                className={`flex gap-3 items-start bg-[rgb(var(--fundo-rgb))] border rounded-lg p-3 transition-opacity ${
                  isHidden
                    ? 'border-[rgb(var(--acento-rgb)/0.04)] opacity-50'
                    : 'border-[rgb(var(--acento-rgb)/0.08)]'
                }`}
              >
                {/* Preview */}
                <div className="w-16 h-16 flex-shrink-0 bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--acento-rgb)/0.12)] rounded overflow-hidden">
                  {image.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        image.url.startsWith('http')
                          ? image.url
                          : image.url.startsWith(BASE_PATH + '/')
                            ? image.url
                            : image.url.startsWith('/')
                              ? `${BASE_PATH}${image.url}`
                              : image.url
                      }
                      alt={image.alt || ''}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[rgb(var(--texto-dim-rgb))] text-[10px]">
                      sem url
                    </div>
                  )}
                </div>

                {/* Campos */}
                <div className="flex-1 space-y-2 min-w-0">
                  {isHidden && (
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[rgb(var(--texto-dim-rgb))] tracking-[0.2em] uppercase">
                      <span className="block w-1.5 h-1.5 rounded-full bg-[rgb(var(--texto-dim-rgb))]" />
                      Oculta — não aparece no /bio
                    </div>
                  )}
                  <input
                    type="text"
                    value={image.url || ''}
                    onChange={(e) => updateImage(idx, 'url', e.target.value)}
                    className={INPUT}
                    placeholder="/images/foto.jpg ou https://..."
                  />
                  <input
                    type="text"
                    value={image.alt || ''}
                    onChange={(e) => updateImage(idx, 'alt', e.target.value)}
                    className={INPUT}
                    placeholder="Descrição (alt text)"
                  />
                </div>

                {/* Controles */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => updateImage(idx, 'hidden', !isHidden)}
                    className={
                      isHidden
                        ? 'px-3 py-1.5 border border-[rgb(var(--acento-rgb)/0.4)] text-[rgb(var(--acento-rgb))] text-[10px] font-sans tracking-wider uppercase rounded-lg hover:bg-[rgb(var(--acento-rgb)/0.1)] transition-colors'
                        : BTN_SECONDARY
                    }
                    title={isHidden ? 'Publicar' : 'Ocultar'}
                  >
                    {isHidden ? 'publicar' : 'ocultar'}
                  </button>
                  <button
                    onClick={() => moveImage(idx, -1)}
                    disabled={idx === 0}
                    className={BTN_SECONDARY + (idx === 0 ? ' opacity-30 cursor-not-allowed' : '')}
                    title="Subir"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveImage(idx, 1)}
                    disabled={idx === data.images.length - 1}
                    className={
                      BTN_SECONDARY +
                      (idx === data.images.length - 1 ? ' opacity-30 cursor-not-allowed' : '')
                    }
                    title="Descer"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeImage(idx)}
                    className={BTN_DANGER_INLINE}
                    title="Remover"
                  >
                    remover
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botões / Cards */}
      <div className={CARD}>
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div>
            <h3 className="font-serif text-[rgb(var(--acento-rgb))] text-sm uppercase tracking-widest">
              Botões e cards
            </h3>
            <p className="text-[11px] text-[rgb(var(--texto-dim-rgb))] mt-1">
              <strong className="text-[rgb(var(--texto-rgb))]">Com imagem</strong> → card com foto.
              <strong className="text-[rgb(var(--texto-rgb))]"> Com ícone</strong> → card com SVG hermético (mandala, livro, chave…).
              <strong className="text-[rgb(var(--texto-rgb))]"> Sem nada</strong> → botão simples.
              Descrição é opcional em todos. Imagem ganha do ícone.
            </p>
          </div>
          <button onClick={addLink} className={BTN_SECONDARY}>
            + Adicionar link
          </button>
        </div>

        {(!data.links || data.links.length === 0) && (
          <p className="text-xs text-[rgb(var(--texto-dim-rgb))] italic text-center py-4">
            Nenhum link ainda. Clique em "Adicionar link".
          </p>
        )}

        <div className="space-y-4">
          {data.links?.map((link, idx) => {
            const preview = resolveLinkImage(link.image);
            const isHidden = !!link.hidden;
            const hasIcon = !preview && hasBioIcon(link.icon);
            return (
              <div
                key={idx}
                className={`bg-[rgb(var(--fundo-rgb))] border rounded-lg p-4 space-y-3 transition-opacity ${
                  isHidden
                    ? 'border-[rgb(var(--acento-rgb)/0.04)] opacity-50'
                    : 'border-[rgb(var(--acento-rgb)/0.08)]'
                }`}
              >
                {isHidden && (
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[rgb(var(--texto-dim-rgb))] tracking-[0.2em] uppercase">
                    <span className="block w-1.5 h-1.5 rounded-full bg-[rgb(var(--texto-dim-rgb))]" />
                    Oculto — não aparece no /bio
                  </div>
                )}
                <div className="flex items-start gap-3">
                  {/* Preview miniatura — imagem OU ícone hermético */}
                  <div className="w-16 h-16 flex-shrink-0 bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--acento-rgb)/0.12)] rounded overflow-hidden flex items-center justify-center">
                    {preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={preview}
                        alt={link.label || ''}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
                      />
                    ) : hasIcon ? (
                      <div className="w-12 h-12">
                        <BioCardIcon name={link.icon} />
                      </div>
                    ) : (
                      <span className="text-[rgb(var(--texto-dim-rgb))] text-[10px] text-center px-1">
                        sem<br/>imagem
                      </span>
                    )}
                  </div>

                  {/* Label + Href */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div>
                      <label className={LABEL}>Texto do botão</label>
                      <input
                        type="text"
                        value={link.label || ''}
                        onChange={(e) => updateLink(idx, 'label', e.target.value)}
                        className={INPUT}
                        placeholder="Ex: Contato comigo"
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Link (href)</label>
                      <input
                        type="text"
                        value={link.href || ''}
                        onChange={(e) => updateLink(idx, 'href', e.target.value)}
                        className={INPUT}
                        placeholder="https://... ou /materiais ou wa.me/..."
                      />
                    </div>
                  </div>

                  {/* Controles */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => updateLink(idx, 'hidden', !isHidden)}
                      className={
                        isHidden
                          ? 'px-3 py-1.5 border border-[rgb(var(--acento-rgb)/0.4)] text-[rgb(var(--acento-rgb))] text-[10px] font-sans tracking-wider uppercase rounded-lg hover:bg-[rgb(var(--acento-rgb)/0.1)] transition-colors'
                          : BTN_SECONDARY
                      }
                      title={isHidden ? 'Publicar (mostrar no /bio)' : 'Ocultar (não mostrar no /bio)'}
                    >
                      {isHidden ? 'publicar' : 'ocultar'}
                    </button>
                    <button
                      onClick={() => moveLink(idx, -1)}
                      disabled={idx === 0}
                      className={BTN_SECONDARY + (idx === 0 ? ' opacity-30 cursor-not-allowed' : '')}
                      title="Subir"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveLink(idx, 1)}
                      disabled={idx === data.links.length - 1}
                      className={BTN_SECONDARY + (idx === data.links.length - 1 ? ' opacity-30 cursor-not-allowed' : '')}
                      title="Descer"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeLink(idx)}
                      className={BTN_DANGER_INLINE}
                      title="Remover"
                    >
                      remover
                    </button>
                  </div>
                </div>

                {/* Imagem + descrição em linha */}
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Imagem (URL opcional)</label>
                    <input
                      type="text"
                      value={link.image || ''}
                      onChange={(e) => updateLink(idx, 'image', e.target.value)}
                      className={INPUT}
                      placeholder="/images/foto.jpg ou https://..."
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Descrição (opcional)</label>
                    <input
                      type="text"
                      value={link.description || ''}
                      onChange={(e) => updateLink(idx, 'description', e.target.value)}
                      className={INPUT}
                      placeholder="Texto curto que aparece antes do botão"
                    />
                  </div>
                </div>

                {/* Grid visual de ícones — clique pra escolher */}
                {!link.image && (
                  <IconPicker
                    value={link.icon || ''}
                    inferred={!link.icon ? inferBioIcon(link) : null}
                    onChange={(name) => updateLink(idx, 'icon', name)}
                  />
                )}
                {link.image && (
                  <p className="text-[11px] text-[rgb(var(--texto-dim-rgb))] italic">
                    Card mostrando a <strong>imagem</strong>. Remova-a pra usar um ícone SVG.
                  </p>
                )}

                {/* Picker de cor/accent — sempre disponível, afeta o card todo */}
                <ColorPicker
                  value={link.accent || ''}
                  positionInList={idx}
                  onChange={(name) => updateLink(idx, 'accent', name)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- Grid visual de ícones SVG ---------- */
function IconPicker({ value, onChange, inferred }) {
  // ignora a opção vazia (vai virar "auto" no header)
  const items = BIO_ICON_OPTIONS.filter((o) => o.value !== '');
  const selected = value || '';
  const effective = selected || inferred || '';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="block text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans">
          Ícone do card
          {!selected && inferred && (
            <span className="ml-2 normal-case tracking-normal text-[rgb(var(--acento-rgb))] italic">
              auto: {BIO_ICON_OPTIONS.find((o) => o.value === inferred)?.label?.toLowerCase() || inferred}
            </span>
          )}
        </label>
        {selected && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--acento-rgb))] transition-colors"
            title="Voltar pra detecção automática pelo label/href"
          >
            usar automático
          </button>
        )}
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 bio-icon-picker">
        {items.map((opt) => {
          const isSelected = selected === opt.value;
          const isAuto = !selected && inferred === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              title={opt.label}
              aria-label={opt.label}
              aria-pressed={isSelected}
              className={
                'group relative aspect-square rounded-lg border transition-all flex flex-col items-center justify-center p-2 pb-4 overflow-hidden ' +
                (isSelected
                  ? 'border-[rgb(var(--acento-rgb))] bg-[rgb(var(--acento-rgb)/0.15)] shadow-[0_0_0_1px_rgb(var(--acento-rgb)/0.5)_inset]'
                  : isAuto
                    ? 'border-[rgb(var(--acento-rgb)/0.45)] bg-[rgb(var(--acento-rgb)/0.06)]'
                    : 'border-[rgb(var(--acento-rgb)/0.15)] bg-[rgb(var(--fundo-rgb))] hover:border-[rgb(var(--acento-rgb))] hover:bg-[rgb(var(--acento-rgb)/0.08)]')
              }
            >
              <div className="picker-icon-slot pointer-events-none flex items-center justify-center" style={{ width: '60%', aspectRatio: '1 / 1' }}>
                <BioCardIcon name={opt.value} />
              </div>
              <span className="block w-full text-[8px] font-sans uppercase tracking-wider text-center text-[rgb(var(--texto-dim-rgb))] group-hover:text-[rgb(var(--acento-rgb))] pointer-events-none truncate mt-1">
                {opt.label}
              </span>
              {isSelected && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[rgb(var(--acento-vivo-rgb))]" />
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-[rgb(var(--texto-dim-rgb))] italic">
        Clique num ícone pra fixar. Sem seleção, o /bio escolhe sozinho pelo nome do link (ex.: "Contato" → WhatsApp).
      </p>
    </div>
  );
}

/* ---------- Picker visual de cor/accent (paleta hermética) ---------- */
function ColorPicker({ value, onChange, positionInList = 0 }) {
  const selected = value || '';
  // accent inferido pelo ciclo padrão quando nada foi escolhido
  const cycleFallback = BIO_ACCENTS[positionInList % BIO_ACCENTS.length]?.value;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="block text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] font-sans">
          Cor do card
          {!selected && cycleFallback && (
            <span className="ml-2 normal-case tracking-normal text-[rgb(var(--acento-rgb))] italic">
              auto: {BIO_ACCENTS.find((a) => a.value === cycleFallback)?.label?.toLowerCase()}
            </span>
          )}
        </label>
        {selected && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[10px] uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))] hover:text-[rgb(var(--acento-rgb))] transition-colors"
            title="Voltar pro ciclo automático de cores"
          >
            usar automático
          </button>
        )}
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {BIO_ACCENTS.map((acc) => {
          const isSelected = selected === acc.value;
          const isAuto = !selected && cycleFallback === acc.value;
          // preview: gradient mídia esquerda → flat direita
          const bg = `linear-gradient(90deg, ${acc.media1} 0%, ${acc.media2} 30%, ${acc.flat} 60%, ${acc.flat} 100%)`;
          return (
            <button
              key={acc.value}
              type="button"
              onClick={() => onChange(acc.value)}
              title={`${acc.label} — ${acc.description}`}
              aria-label={acc.label}
              aria-pressed={isSelected}
              className={
                'group relative aspect-[5/4] rounded-lg border transition-all overflow-hidden ' +
                (isSelected
                  ? 'border-[rgb(var(--acento-vivo-rgb))] shadow-[0_0_0_2px_rgb(var(--ouro-rgb)/0.55)]'
                  : isAuto
                    ? 'border-[rgb(var(--acento-rgb)/0.45)]'
                    : 'border-[rgb(var(--acento-rgb)/0.12)] hover:border-[rgb(var(--acento-rgb))]')
              }
              style={{ background: bg }}
            >
              {/* label embaixo, em barra translúcida pra dar legibilidade */}
              <span
                className="absolute bottom-0 left-0 right-0 px-1 py-0.5 text-[8px] font-sans uppercase tracking-wider text-center truncate"
                style={{
                  background: 'rgb(var(--fundo-rgb)/0.72)',
                  color: '#13211F',
                }}
              >
                {acc.label}
              </span>
              {isSelected && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[rgb(var(--acento-vivo-rgb))] shadow-[0_0_0_1px_rgb(var(--fundo-rgb)/0.8)]" />
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-[rgb(var(--texto-dim-rgb))] italic">
        Clique numa cor pra fixar este card. Sem seleção, o /bio alterna entre as 10 cores pra dar ritmo visual.
      </p>
    </div>
  );
}

/* ---------- Toggle inline (mesma chave de raposa_admin_visibility) ---------- */
function AuthorToggle({ checked, onChange, label, hint }) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${checked ? 'Ocultar' : 'Mostrar'} ${label}`}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors mt-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--acento-rgb))] ${
          checked ? 'bg-[rgb(var(--acento-rgb))]' : 'bg-[rgb(var(--acento-rgb)/0.15)]'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-[rgb(var(--fundo-rgb))] transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
      <button type="button" onClick={() => onChange(!checked)} className="flex-1 min-w-0 text-left">
        <p className={`text-sm font-sans ${checked ? 'text-[rgb(var(--texto-forte-rgb))]' : 'text-[rgb(var(--texto-dim-rgb))]'} transition-colors`}>
          {label}
        </p>
        {hint && <p className="text-[10px] text-[rgb(var(--texto-dim-rgb))] mt-0.5">{hint}</p>}
      </button>
    </div>
  );
}
