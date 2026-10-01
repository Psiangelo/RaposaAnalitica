import Link from 'next/link';

/**
 * Breadcrumbs — trilha de navegação editorial.
 *
 * Props:
 *   items: Array<{ name: string, href?: string }>
 *     - Primeiro item é sempre "Home" (opcional — se omitido, prependa
 *       automaticamente)
 *     - Último item renderiza como texto (página atual, sem link)
 *
 * O JSON-LD BreadcrumbList fica em TherapySchema; aqui só UI.
 */
export default function Breadcrumbs({ items = [], className = '' }) {
  const trail = items[0]?.href === '/'
    ? items
    : [{ name: 'Início', href: '/' }, ...items];

  return (
    <nav
      aria-label="Trilha de navegação"
      className={`font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase text-text-dim ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {trail.map((item, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={`${item.name}-${i}`} className="flex items-center gap-2">
              {i > 0 && (
                <span aria-hidden className="text-accent/40">·</span>
              )}
              {isLast || !item.href ? (
                <span aria-current={isLast ? 'page' : undefined} className="text-accent">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline focus-visible:outline-accent focus-visible:outline-offset-2"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
