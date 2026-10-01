'use client';

import { motion } from 'framer-motion';
import ToriiMarco from '@/components/raposa/ToriiMarco';

/**
 * Timeline — o caminho de torii. Uma coluna à esquerda com um torii por
 * item (vazado se não começou, contornado se em curso, vermelho cheio se
 * concluído) e o caminho de pedras entre eles, que fica vermelho conforme
 * avança. Os cards vêm do caller (renderItem).
 *
 * Props:
 *   items: [{ id, pct, accent }]
 *   renderItem: (item, idx) => ReactNode
 *   defaultAccent: cor (o torii é vermelho; trilhas «extra» usam a cor delas)
 */
export default function Timeline({ items = [], renderItem, defaultAccent }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const vermelho = 'var(--torii)';

  return (
    <ol role="list" className="relative" aria-label="O caminho">
      {items.map((item, idx) => {
        const pct = Math.max(0, Math.min(100, item.pct || 0));
        const cor = item.extra ? item.accent || defaultAccent : vermelho;
        const isLast = idx === items.length - 1;
        const estado = pct === 100 ? 'feito' : pct > 0 || item.proxima ? 'curso' : 'vazio';
        const andado = pct === 100;
        return (
          <li key={item.id} className="relative grid grid-cols-[52px_1fr] md:grid-cols-[76px_1fr] gap-x-3 md:gap-x-6">
            <div className="relative flex flex-col items-center">
              <motion.span
                initial={{ scale: 0.7, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 mt-3 flex items-center justify-center w-[46px] h-[46px] md:w-[58px] md:h-[58px] rounded-full bg-bg-card border-[1.5px] border-linha"
                title={`${Math.round(pct)}% concluído`}
              >
                <ToriiMarco estado={estado} tamanho={30} cor={cor} />
              </motion.span>
              {!isLast && (
                <span
                  aria-hidden
                  className="flex-1 w-[4px] my-1 rounded-full min-h-[60px]"
                  style={{
                    backgroundImage: andado
                      ? `linear-gradient(${cor}, ${cor})`
                      : 'repeating-linear-gradient(to bottom, rgb(var(--linha-rgb)) 0 10px, transparent 10px 18px)',
                  }}
                />
              )}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="pb-10 md:pb-12 min-w-0"
            >
              {renderItem(item, idx)}
            </motion.div>
          </li>
        );
      })}
    </ol>
  );
}
