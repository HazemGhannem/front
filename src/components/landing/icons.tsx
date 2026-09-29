// Small stroke icons used on the home page (24×24, inherit currentColor).
import type { SVGProps } from "react";

const base = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const MonitorIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>
);
export const PointerIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M5 3l6 16 2.2-6.3L19.5 10z" /><path d="M13.5 13.5 19 19" /></svg>
);
export const FolderIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M12 11v5M9.5 13.5 12 16l2.5-2.5" /></svg>
);
export const WifiIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0" /><circle cx="12" cy="19" r="1" fill="currentColor" /></svg>
);
export const LockIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
);
export const KeyIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M17 6l3 3M15 8l2 2" /></svg>
);
export const LinkIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
);
export const ShieldIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>
);
export const DownloadIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} width={18} height={18} {...p}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
);
