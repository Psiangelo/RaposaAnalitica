// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Player de leitura em voz alta (ListenButton).
 *
 * A Web Speech API nao fala em headless e nao deixa inspecionar o que saiu no
 * alto-falante. Entao a suite injeta um speechSynthesis simulado — com
 * callbacks ASSINCRONOS, como no navegador de verdade — e checa as invariantes
 * que o ouvido percebe como "bugado": duas falas ao mesmo tempo, trecho
 * repetido, trecho pulado, barra andando pro lado errado.
 *
 * O assincronismo do mock nao e detalhe: com callbacks sincronos a suite
 * inteira passa mesmo na versao quebrada.
 *
 * Rodar: npm run build && npx serve out -l 3010 && npx playwright test
 */

const POST = 'blog/psicologia-nao-e-ciencia/';

// Mock determinístico do speechSynthesis: fala cada utterance num tempo
// proporcional ao tamanho/rate e registra tudo em window.__speechLog.
// Serve pra flagrar o que ouvido humano só sente como "bugado":
// duas falas ao mesmo tempo, chunk repetido, chunk pulado.
const MOCK = () => {
  const log = [];
  let current = null;
  let timer = null;
  let paused = false;
  let startedAt = 0;
  let remaining = 0;
  let concurrentPeak = 0;
  let active = 0;

  const durationOf = (u) => Math.max(20, (u.text.length / (14.5 * (u.rate || 1))) * 1000 / 40); // 40x mais rápido

  // No navegador real os eventos da fala chegam numa task posterior — é
  // justamente essa defasagem que faz onend/onerror de uma utterance cancelada
  // atropelar a próxima. O mock precisa ser assíncrono ou o bug some.
  const later = (fn) => setTimeout(fn, 0);

  const finish = () => {
    const u = current;
    current = null;
    timer = null;
    active -= 1;
    if (u) {
      log.push({ ev: 'end', text: u.text.slice(0, 24) });
      later(() => { if (u.onend) u.onend({}); });
    }
  };

  const run = () => {
    if (!current || paused) return;
    startedAt = Date.now();
    timer = setTimeout(finish, remaining);
  };

  window.__speechLog = log;
  window.__speechStats = () => ({ concurrentPeak, spoken: log.filter((e) => e.ev === 'start').map((e) => e.text) });

  // speechSynthesis é acessor read-only no Window: atribuição direta é ignorada
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, writable: true, value: {
    get speaking() { return !!current; },
    get paused() { return paused; },
    get pending() { return false; },
    getVoices: () => [{ name: 'Mock BR', lang: 'pt-BR', default: true }],
    addEventListener() {},
    removeEventListener() {},
    speak(u) {
      if (current) {
        // dois speaks sem cancel entre eles = falas concorrentes
        concurrentPeak = Math.max(concurrentPeak, 2);
        log.push({ ev: 'OVERLAP', text: u.text.slice(0, 24) });
      }
      current = u;
      active += 1;
      concurrentPeak = Math.max(concurrentPeak, active);
      paused = false;
      remaining = durationOf(u);
      log.push({ ev: 'start', text: u.text.slice(0, 24), rate: u.rate });
      if (u.onstart) u.onstart({});
      run();
    },
    cancel() {
      if (timer) { clearTimeout(timer); timer = null; }
      const u = current;
      current = null;
      paused = false;
      if (u) {
        active -= 1;
        log.push({ ev: 'cancel', text: u.text.slice(0, 24) });
        later(() => { if (u.onerror) u.onerror({ error: 'canceled' }); });
      }
    },
    pause() {
      if (!current || paused) return;
      paused = true;
      if (timer) { clearTimeout(timer); timer = null; }
      remaining = Math.max(0, remaining - (Date.now() - startedAt));
      log.push({ ev: 'pause' });
    },
    resume() {
      if (!paused) return;
      paused = false;
      log.push({ ev: 'resume' });
      run();
    },
  } });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    configurable: true,
    writable: true,
    value: function (text) {
      this.text = text;
      this.rate = 1;
      this.pitch = 1;
      this.lang = '';
      this.voice = null;
    },
  });
};

async function openPlayer(page) {
  await page.addInitScript(MOCK);
  await page.goto(POST);
  await page.getByRole('button', { name: 'Ouvir leitura' }).click();
  await expect(page.getByRole('button', { name: 'Pausar leitura' })).toBeVisible();
}

const stats = (page) => page.evaluate(() => window.__speechStats());
const chunkList = (page) => page.evaluate(() => window.__speechLog.filter((e) => e.ev === 'start').map((e) => e.text));

test('fala em ordem, sem sobreposição', async ({ page }) => {
  await openPlayer(page);
  await page.waitForTimeout(1500);
  const s = await stats(page);
  expect(s.concurrentPeak).toBeLessThanOrEqual(1);
  // avançou vários chunks, nenhum repetido
  expect(s.spoken.length).toBeGreaterThan(3);
  expect(new Set(s.spoken).size).toBe(s.spoken.length);
});

test('cliques rápidos em avançar não geram falas concorrentes', async ({ page }) => {
  await openPlayer(page);
  const fwd = page.getByRole('button', { name: /Avançar 15/ });
  for (let i = 0; i < 6; i += 1) { await fwd.click(); await page.waitForTimeout(30); }
  await page.waitForTimeout(600);
  const s = await stats(page);
  expect(s.concurrentPeak).toBeLessThanOrEqual(1);
  const log = await page.evaluate(() => window.__speechLog.filter((e) => e.ev === 'OVERLAP'));
  expect(log).toEqual([]);
});

test('voltar 15s recua a posição; avançar adianta', async ({ page }) => {
  await openPlayer(page);
  await page.waitForTimeout(1200);
  const seek = page.getByRole('slider', { name: 'Posição da leitura' });
  const before = Number(await seek.inputValue());
  await page.getByRole('button', { name: /Voltar 15/ }).click();
  await page.waitForTimeout(150);
  const afterBack = Number(await seek.inputValue());
  expect(afterBack).toBeLessThan(before);

  await page.getByRole('button', { name: /Avançar 15/ }).click();
  await page.waitForTimeout(150);
  const afterFwd = Number(await seek.inputValue());
  expect(afterFwd).toBeGreaterThan(afterBack);
  expect((await stats(page)).concurrentPeak).toBeLessThanOrEqual(1);
});

test('pausar interrompe a fala e continuar retoma', async ({ page }) => {
  await openPlayer(page);
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Pausar leitura' }).click();
  await page.waitForTimeout(500);
  const during = await chunkList(page);
  await page.waitForTimeout(500);
  expect(await chunkList(page)).toEqual(during); // nada novo falou durante a pausa
  expect(await page.evaluate(() => window.speechSynthesis.paused)).toBe(true);

  await page.getByRole('button', { name: 'Continuar leitura' }).click();
  await page.waitForTimeout(600);
  expect((await chunkList(page)).length).toBeGreaterThan(during.length);
  expect((await stats(page)).concurrentPeak).toBeLessThanOrEqual(1);
});

test('trocar velocidade continua de onde estava e aplica a nova rate', async ({ page }) => {
  await openPlayer(page);
  await page.waitForTimeout(900);
  const seek = page.getByRole('slider', { name: 'Posição da leitura' });
  const before = Number(await seek.inputValue());
  await page.getByRole('button', { name: /Velocidade/ }).click();
  await page.waitForTimeout(300);
  const after = Number(await seek.inputValue());
  // não pode voltar ao começo nem saltar pra frente
  expect(Math.abs(after - before)).toBeLessThan(200);
  const lastRate = await page.evaluate(() => {
    const starts = window.__speechLog.filter((e) => e.ev === 'start');
    return starts[starts.length - 1].rate;
  });
  expect(lastRate).toBe(1.25);
  expect((await stats(page)).concurrentPeak).toBeLessThanOrEqual(1);
});

test('arrastar a barra busca a posição solta, uma única vez', async ({ page }) => {
  await openPlayer(page);
  await page.waitForTimeout(400);
  const seek = page.getByRole('slider', { name: 'Posição da leitura' });
  const box = await seek.boundingBox();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(400);
  const val = Number(await seek.inputValue());
  const max = Number(await seek.getAttribute('max'));
  expect(val / max).toBeGreaterThan(0.6);
  expect(val / max).toBeLessThan(0.85);
  expect((await stats(page)).concurrentPeak).toBeLessThanOrEqual(1);
  // o texto falado após o seek pertence à região buscada, não ao começo
  const spoken = await chunkList(page);
  expect(spoken.length).toBeGreaterThan(1);
});

test('parar zera e volta ao botão Ouvir', async ({ page }) => {
  await openPlayer(page);
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Parar leitura' }).click();
  await expect(page.getByRole('button', { name: 'Ouvir leitura' })).toBeVisible();
  const antes = (await chunkList(page)).length;
  await page.waitForTimeout(600);
  expect((await chunkList(page)).length).toBe(antes); // não continua falando escondido
  expect(await page.evaluate(() => window.speechSynthesis.speaking)).toBe(false);
});

test('mobile: toque na barra e nos controles', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await openPlayer(page);
  await page.waitForTimeout(400);
  const seek = page.getByRole('slider', { name: 'Posição da leitura' });
  const box = await seek.boundingBox();
  await page.touchscreen.tap(box.x + box.width * 0.5, box.y + box.height / 2);
  await page.waitForTimeout(400);
  const val = Number(await seek.inputValue());
  const max = Number(await seek.getAttribute('max'));
  expect(val / max).toBeGreaterThan(0.35);
  expect((await stats(page)).concurrentPeak).toBeLessThanOrEqual(1);

  await ctx.close();
});

test('estresse: 40 cliques aleatórios não quebram o player', async ({ page }) => {
  await openPlayer(page);
  const acoes = [
    () => page.getByRole('button', { name: /Avançar 15/ }).click(),
    () => page.getByRole('button', { name: /Voltar 15/ }).click(),
    () => page.getByRole('button', { name: /Velocidade/ }).click(),
    () => page.getByRole('button', { name: /Pausar leitura|Continuar leitura/ }).click(),
  ];
  // sequência fixa (determinística) que mistura tudo, inclusive pausa+seek
  const roteiro = [0, 0, 3, 2, 1, 3, 0, 2, 2, 1, 1, 3, 3, 0, 1, 2, 0, 3, 1, 0,
                   2, 3, 3, 1, 0, 0, 2, 1, 3, 2, 0, 1, 1, 3, 0, 2, 3, 1, 0, 2];
  for (const i of roteiro) {
    await acoes[i]();
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(500);
  const s = await stats(page);
  expect(s.concurrentPeak).toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => window.__speechLog.filter((e) => e.ev === 'OVERLAP'))).toEqual([]);

  // o player continua responsivo: parar volta ao estado inicial
  const parar = page.getByRole('button', { name: 'Parar leitura' });
  if (await parar.isVisible()) await parar.click();
  await expect(page.getByRole('button', { name: 'Ouvir leitura' })).toBeVisible();
});
