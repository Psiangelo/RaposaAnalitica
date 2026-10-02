'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { BASE_PATH } from '@/lib/site';

export default function Redireciona() {
  useEffect(() => {
    window.location.replace(`${BASE_PATH}/blog/#cartas`);
  }, []);
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 text-center font-sans text-text">
      <p>
        As Cartas agora ficam no pé do blog. <Link href="/blog/#cartas" className="underline">Ir para lá</Link>.
      </p>
    </main>
  );
}
