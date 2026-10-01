/**
 * LogoMark — marca oficial Psiangelo (família Geo · Triângulo).
 *
 * Três variantes:
 *   <LogoMarkInline />  — horizontal compacto pra navbar (h ~28px)
 *   <LogoMarkFull />    — wordmark completo com frames (hero/footer)
 *   <LogoMarkIcon />    — só o triângulo + ponto (favicon/avatar)
 *
 * Cores usadas:
 *   accent: #2E5240, bright: #13211F
 */

const ACCENT = '#2E5240';
const BRIGHT = '#13211F';

/* ============== INLINE — navbar ============== */
export function LogoMarkInline({ className = '', height = 26 }) {
  // viewBox horizontal, compacto
  return (
    <svg
      viewBox="0 0 260 60"
      height={height}
      width={height * (260 / 60)}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Psiangelo"
    >
      {/* triângulo mínimo à esquerda */}
      <polygon points="14,14 26,36 2,36" fill="none" stroke={ACCENT} strokeOpacity="0.7" strokeWidth="1.2" />
      <circle cx="14" cy="30" r="1.6" fill={ACCENT} />

      {/* wordmark */}
      <text
        x="40"
        y="40"
        fontFamily="Georgia, serif"
        fontStyle="italic"
        fontSize="32"
        fill={BRIGHT}
        letterSpacing="-0.5"
      >
        Psi<tspan fill={ACCENT}>angelo</tspan>
      </text>
    </svg>
  );
}

/* ============== FULL — wordmark completo com frames ============== */
export function LogoMarkFull({ className = '', showTagline = true }) {
  return (
    <svg
      viewBox="0 0 800 260"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Psiangelo"
    >
      {/* triângulo vazado acima */}
      <polygon points="400,34 424,80 376,80" fill="none" stroke={ACCENT} strokeOpacity="0.55" strokeWidth="1" />
      <circle cx="400" cy="62" r="3" fill={ACCENT} />

      {/* molduras horizontais */}
      <line x1="120" y1="110" x2="680" y2="110" stroke={ACCENT} strokeOpacity="0.35" strokeWidth="0.8" />
      <line x1="120" y1="200" x2="680" y2="200" stroke={ACCENT} strokeOpacity="0.35" strokeWidth="0.8" />

      {/* Wordmark */}
      <text
        x="400"
        y="176"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontStyle="italic"
        fontSize="88"
        fill={BRIGHT}
        letterSpacing="-1"
      >
        Psi<tspan fill={ACCENT}>angelo</tspan>
      </text>

      {/* pontos cardeais */}
      {[[120, 110], [680, 110], [120, 200], [680, 200]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill={ACCENT} />
      ))}

      {showTagline && (
        <text
          x="400"
          y="238"
          textAnchor="middle"
          fontFamily="'Courier New', monospace"
          fontSize="12"
          fill={ACCENT}
          letterSpacing="6"
          opacity="0.85"
        >
          PSICOLOGIA · ANALÍTICA
        </text>
      )}
    </svg>
  );
}

/* ============== ICON — favicon/avatar, só o triângulo com ponto ============== */
export function LogoMarkIcon({ className = '', size = 64 }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Psiangelo"
    >
      {/* triângulo */}
      <polygon
        points="32,12 50,48 14,48"
        fill="none"
        stroke={ACCENT}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* ponto central */}
      <circle cx="32" cy="36" r="3" fill={ACCENT} />
    </svg>
  );
}
