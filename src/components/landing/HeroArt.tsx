// Decorative hero illustration: a PC screen mirrored onto a phone, joined by
// a dashed "direct connection" line. Pure SVG, no images to load.
export function HeroArt() {
  return (
    <svg viewBox="0 0 520 380" className="w-full h-auto" role="img" aria-label="Your PC's screen shown live on your phone">
      <defs>
        <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1b2a4a" />
          <stop offset="1" stopColor="#0f1a2e" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#2f6fed" stopOpacity="0.35" />
          <stop offset="1" stopColor="#2f6fed" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="260" cy="200" rx="250" ry="170" fill="url(#glow)" />

      {/* Monitor */}
      <rect x="20" y="40" width="330" height="210" rx="14" fill="#171b22" stroke="#2c323d" strokeWidth="2" />
      <rect x="34" y="54" width="302" height="170" rx="6" fill="url(#screen)" />
      {/* windows on the PC screen */}
      <rect x="52" y="72" width="150" height="96" rx="5" fill="#223457" />
      <rect x="52" y="72" width="150" height="14" rx="5" fill="#2f4a7d" />
      <rect x="62" y="98" width="100" height="6" rx="3" fill="#3d5a94" />
      <rect x="62" y="112" width="120" height="6" rx="3" fill="#3d5a94" />
      <rect x="62" y="126" width="80" height="6" rx="3" fill="#3d5a94" />
      <rect x="216" y="96" width="102" height="110" rx="5" fill="#1f3050" />
      <rect x="228" y="112" width="30" height="24" rx="3" fill="#3ee6ab" opacity="0.8" />
      <rect x="266" y="112" width="30" height="24" rx="3" fill="#5b8def" opacity="0.8" />
      <rect x="228" y="144" width="30" height="24" rx="3" fill="#5b8def" opacity="0.6" />
      <rect x="266" y="144" width="30" height="24" rx="3" fill="#8fb0f5" opacity="0.6" />
      {/* cursor */}
      <path d="M170 150 l0 26 l7 -7 l5 11 l5 -2 l-5 -11 l10 0 z" fill="#fff" stroke="#0c0d10" strokeWidth="1.5" />
      {/* stand */}
      <path d="M160 250 h50 l10 42 h-70 z" fill="#171b22" stroke="#2c323d" strokeWidth="2" />
      <rect x="120" y="290" width="130" height="10" rx="5" fill="#262b35" />

      {/* connection line */}
      <path d="M330 170 C 380 170, 380 230, 400 236" fill="none" stroke="#3ee6ab" strokeWidth="2.5" strokeDasharray="6 7" strokeLinecap="round" />
      <circle cx="330" cy="170" r="5" fill="#3ee6ab" />

      {/* Phone */}
      <rect x="392" y="130" width="112" height="226" rx="20" fill="#0f1217" stroke="#3a4150" strokeWidth="2" />
      <rect x="402" y="152" width="92" height="184" rx="8" fill="#12151b" />
      <rect x="436" y="140" width="24" height="5" rx="2.5" fill="#262b35" />
      {/* mirrored screen in phone (landscape inside) */}
      <rect x="408" y="196" width="80" height="50" rx="4" fill="url(#screen)" />
      <rect x="413" y="202" width="38" height="24" rx="2" fill="#223457" />
      <rect x="455" y="208" width="27" height="31" rx="2" fill="#1f3050" />
      <rect x="459" y="212" width="8" height="7" rx="1" fill="#3ee6ab" opacity="0.8" />
      <rect x="470" y="212" width="8" height="7" rx="1" fill="#5b8def" opacity="0.8" />
      <rect x="408" y="160" width="46" height="7" rx="3.5" fill="#262b35" />
      <circle cx="484" cy="163.5" r="4" fill="#3ee6ab" />
      {/* touch controls */}
      <rect x="408" y="262" width="80" height="34" rx="8" fill="#171b22" stroke="#262b35" />
      <circle cx="428" cy="279" r="8" fill="#262b35" />
      <circle cx="448" cy="279" r="8" fill="#262b35" />
      <circle cx="468" cy="279" r="8" fill="#2f6fed" />
      <rect x="408" y="306" width="80" height="18" rx="6" fill="#171b22" stroke="#262b35" />
    </svg>
  );
}
