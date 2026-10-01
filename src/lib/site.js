// Endereço do site num lugar só. Para trocar de hospedagem (por exemplo, um
// domínio próprio sem subpasta), defina NEXT_PUBLIC_SITE_ORIGIN e
// NEXT_PUBLIC_BASE_PATH no build; next.config.js lê as mesmas variáveis.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '/RaposaAnalitica';
export const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_ORIGIN || 'https://psiangelo.github.io';
export const SITE_URL = `${SITE_ORIGIN}${BASE_PATH}`;
export const SITE_NAME = 'Raposa Analítica';
export const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO || 'Psiangelo/RaposaAnalitica';
