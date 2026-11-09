/** Small shared line icons for the landing page. All are decorative (aria-hidden). */

type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export function GlobeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="17" height="17" {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.6 9h16.8M3.6 15h16.8" />
      <path d="M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3Z" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="13" height="13" {...base} strokeWidth={2.4}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="16" height="16" {...base} strokeWidth={2.6}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18" {...base} strokeWidth={2.4}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

export function ExternalArrowIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="12" height="12" {...base} strokeWidth={2.4}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="24" height="24" {...base}>
      <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="24" height="24" {...base}>
      <path d="M18 9a6 6 0 0 0-12 0c0 4.4-1.6 5.7-2 6.5h16c-.4-.8-2-2.1-2-6.5Z" />
      <path d="M10 19a2.2 2.2 0 0 0 4 0" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="24" height="24" {...base}>
      <path d="M12 3 5 6v5.5c0 4.4 3 7.9 7 9.5 4-1.6 7-5.1 7-9.5V6l-7-3Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </svg>
  );
}

export function PlayStoreIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="22" height="22" aria-hidden focusable={false} fill="currentColor">
      <path d="M4.3 2.6a1 1 0 0 0-.3.7v17.4a1 1 0 0 0 .3.7l9.2-9.4-9.2-9.4Z" opacity=".95" />
      <path d="m13.5 12 2.6 2.7-9.9 5.9c-.5.3-1 .2-1.3-.2L13.5 12Zm0 0 2.6-2.7L6 3.4c-.5-.3-1-.2-1.3.2L13.5 12Z" opacity=".7" />
      <path d="m16.1 9.3 3.5 2.1c.6.4.6 1.2 0 1.6l-3.5 2.1-2.9-3 2.9-2.8Z" />
    </svg>
  );
}

export function AppleIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="21" height="21" aria-hidden focusable={false} fill="currentColor">
      <path d="M16.7 12.8c0-2.4 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.1 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.3 2.5 1.3 0 1.8-.8 3.4-.8 1.6 0 2 .8 3.3.8 1.4 0 2.3-1.3 3.2-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.9-1.1-2.9-4.1Z" />
      <path d="M14.2 5.4c.7-.9 1.2-2.2 1.1-3.4-1.1 0-2.4.7-3.2 1.6-.7.8-1.3 2.1-1.1 3.3 1.2.1 2.4-.6 3.2-1.5Z" />
    </svg>
  );
}

export function MonitorIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="21" height="21" {...base}>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}
