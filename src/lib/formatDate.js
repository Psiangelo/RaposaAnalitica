/**
 * formatPostDate — data de publicação, igual no servidor e no cliente.
 *
 * ⚠️ NÃO remover o `timeZone: 'UTC'`. Sem ele, `toLocaleDateString` usa o
 * fuso de quem executa: o build roda em UTC (GitHub Actions) e o leitor está
 * em UTC-3. Um post salvo às 01:20 UTC vira "24 de abril" no HTML estático e
 * "23 de abril" no navegador do leitor.
 *
 * Isso não é cosmético: texto diferente entre servidor e cliente quebra a
 * hidratação do React (erros #425 → #418 → #423), e o #423 derruba a página
 * inteira com "Application error: a client-side exception has occurred".
 * Foi o que aconteceu em /blog/ e nos posts até 30/07/2026 — e só num dos
 * quatro posts, o único cujo horário cruzava a virada do dia, o que fazia o
 * defeito parecer aleatório.
 *
 * Fixar em UTC também é o certo do ponto de vista do conteúdo: a data de
 * publicação de um ensaio é um fato do texto, não algo que muda conforme o
 * fuso de quem lê.
 */
export function formatPostDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Versão curta (24 abr 2026), mesmo cuidado com o fuso. */
export function formatPostDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
