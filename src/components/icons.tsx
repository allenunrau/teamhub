import type { SVGProps } from "react";

function base(props: SVGProps<SVGSVGElement>) {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export const icons = {
  home: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  ),
  calendar: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <rect x="3.5" y="5" width="17" height="16" rx="2.2" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </svg>
  ),
  board: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M4 5.5a2 2 0 0 1 2-2h9.5L20 7v11.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M8 10h8M8 14h5" />
    </svg>
  ),
  megaphone: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M4 10v4a1 1 0 0 0 1 1h2l1 5h2l-1-5h1l9 4V6l-9 4H5a1 1 0 0 0-1 1z" />
    </svg>
  ),
  users: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.8 19c.7-3 3-4.7 6.2-4.7s5.5 1.7 6.2 4.7" />
      <path d="M16 4.5a3.2 3.2 0 0 1 0 6.3" />
      <path d="M15 14.3c2.7.4 4.6 2 5.2 4.7" />
    </svg>
  ),
  logout: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <path d="M15 16l4-4-4-4M19 12H9" />
    </svg>
  ),
  menu: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  close: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  plus: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  check: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),
  trash: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.8 12.1a2 2 0 0 1-2 1.9H9.8a2 2 0 0 1-2-1.9L7 7" />
    </svg>
  ),
  pin: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M12 2 9.5 8.5 4 10l4.5 3.5L7 19l5-3.6L17 19l-1.5-5.5L20 10l-5.5-1.5z" />
    </svg>
  ),
  chevronLeft: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  ),
  chevronRight: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  ),
  reply: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M9 17 4 12l5-5" />
      <path d="M4 12h10a5 5 0 0 1 5 5v1" />
    </svg>
  ),
  mapPin: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </svg>
  ),
  shield: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
    </svg>
  ),
};
