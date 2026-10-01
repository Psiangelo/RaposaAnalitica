import { test, expect } from '@playwright/test';

/**
 * Card do glossário dentro do ensaio.
 *
 * Por que este teste existe: em 2026-07-30 o card parou de abrir e nenhuma
 * verificação de HTML estático pegou, porque o defeito era só em runtime. O
 * TermPreview prendia listeners a cada âncora no mount; depois da hidratação
 * o useSitedata relia o post e o React substituía os nós do corpo, levando os
 * listeners embora. O clique voltava a navegar e o card sumia.
 *
 * A correção foi delegação de evento no container. Este teste falha se alguém
 * voltar a prender listener por âncora.
 */

const POST = '/blog/o-que-e-consciencia-em-jung/';

test('termo do glossário abre o card e NÃO navega', async ({ page }) => {
  await page.goto(POST, { waitUntil: 'networkidle' });
  const urlAntes = page.url();

  const termo = page.locator('a.term-link').first();
  await expect(termo).toHaveCount(1);

  // a âncora tem que ser link de verdade no HTML (é o link interno que
  // sustenta o silo de SEO), com href real e sem target
  await expect(termo).toHaveAttribute('href', /\/glossario\/[a-z-]+\/$/);
  expect(await termo.getAttribute('target')).toBeNull();

  await termo.click();

  const card = page.locator('.term-preview-popover');
  await expect(card).toBeVisible();
  await expect(card).toContainText(/\S/);
  expect(page.url()).toBe(urlAntes); // não navegou
});

test('o link dentro do card abre em nova aba', async ({ page }) => {
  await page.goto(POST, { waitUntil: 'networkidle' });
  await page.locator('a.term-link').first().click();

  const link = page.locator('.term-preview-popover .term-preview-link');
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
});

test('Esc fecha o card', async ({ page }) => {
  await page.goto(POST, { waitUntil: 'networkidle' });
  await page.locator('a.term-link').first().click();
  await expect(page.locator('.term-preview-popover')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator('.term-preview-popover')).toBeHidden();
});

test('no celular, o toque abre o card', async ({ browser }) => {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await ctx.newPage();
  await page.goto(POST, { waitUntil: 'networkidle' });

  const termo = page.locator('a.term-link').first();
  await termo.tap();

  const card = page.locator('.term-preview-popover');
  await expect(card).toBeVisible();

  // não pode vazar da viewport
  const box = await card.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);

  // botão de fechar tem que existir no touch (não há "clicar fora" óbvio)
  await expect(page.locator('.term-preview-popover .term-preview-close')).toBeVisible();
  await ctx.close();
});
