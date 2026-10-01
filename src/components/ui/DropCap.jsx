'use client';

/**
 * DropCap — wrapper semântico que aplica a classe `.drop-cap` (definida em
 * globals.css). Simplifica o uso em locais onde queremos a inicial gigante
 * sem depender do CSS automático do .blog-post-body.
 *
 * Uso:
 *   <DropCap>Atendo em clínica desde…</DropCap>
 */
export default function DropCap({ children, className = '', as: Tag = 'p' }) {
  return (
    <Tag className={`drop-cap ${className}`}>
      {children}
    </Tag>
  );
}
