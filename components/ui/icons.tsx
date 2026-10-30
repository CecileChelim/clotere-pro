// Petites icônes inline (pas de dépendance externe) utilisées dans tout le site.

export function IconCheck({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 10.5l3.5 3.5L16 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCross({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 10h12M11 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 7.5l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCopy({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <rect x="7" y="7" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M13 7V5.5A1.5 1.5 0 0011.5 4H5.5A1.5 1.5 0 004 5.5v6A1.5 1.5 0 005.5 13H7"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function IconShield({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 3l6 2.2v4.3c0 4-2.6 6.6-6 7.5-3.4-.9-6-3.5-6-7.5V5.2L10 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconWindow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <rect x="2.5" y="4" width="15" height="12" rx="1.8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 7.5h15" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="5.2" cy="5.7" r="0.6" fill="currentColor" />
      <circle cx="7" cy="5.7" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function IconSearch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="8.8" cy="8.8" r="5.3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16.5 16.5l-3.6-3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconCalendarCheck({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <rect x="2.5" y="4" width="15" height="13" rx="1.8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 8h15M6 2.3v3M14 2.3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M7 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconShare({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="15" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="5" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="15.5" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.7 8.9l6.6-3.3M6.7 11.1l6.6 3.3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconStar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M10 2.3l2.35 4.76 5.25.76-3.8 3.7.9 5.23L10 14.3l-4.7 2.47.9-5.24-3.8-3.7 5.25-.76L10 2.3z" />
    </svg>
  );
}

export function IconAlertTriangle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 3.3l7.8 13.5a1 1 0 01-.87 1.5H3.07a1 1 0 01-.87-1.5L10 3.3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 8v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="14.7" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function IconExternalLink({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M8.5 4.5H4.8A1.3 1.3 0 003.5 5.8v9.4a1.3 1.3 0 001.3 1.3h9.4a1.3 1.3 0 001.3-1.3v-3.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 3.5H16.5V8.5M16.3 3.7L9.5 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Icône de marque — couleur LinkedIn fixe (pas currentColor) : on représente
// le réseau lui-même, pas un état de l'UI.
export function IconLinkedin({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="#0A66C2" />
      <path
        d="M7.4 9.6H4.8V19h2.6V9.6zM6.1 5c-.9 0-1.5.6-1.5 1.4 0 .8.6 1.4 1.5 1.4.9 0 1.5-.6 1.5-1.4C7.6 5.6 7 5 6.1 5zM19.2 13.4c0-2.6-1.4-3.9-3.3-3.9-1.5 0-2.2.9-2.6 1.5v-1.4H10.7c0 .7 0 9.4 0 9.4h2.6v-5.2c0-.3 0-.6.1-.8.2-.6.7-1.2 1.6-1.2 1.1 0 1.6.9 1.6 2.2V19h2.6v-5.6z"
        fill="#fff"
      />
    </svg>
  );
}

export function IconQuote({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4 8.5c0-2.8 1.7-4.6 4.3-5.2l.5 1.4C7 5.2 6.2 6.2 6.1 7.5c.3-.1.6-.2 1-.2 1.4 0 2.4 1 2.4 2.4 0 1.5-1.1 2.6-2.6 2.6-1.7 0-2.9-1.4-2.9-3.8zm8 0c0-2.8 1.7-4.6 4.3-5.2l.5 1.4c-1.8.5-2.6 1.5-2.7 2.8.3-.1.6-.2 1-.2 1.4 0 2.4 1 2.4 2.4 0 1.5-1.1 2.6-2.6 2.6-1.7 0-2.9-1.4-2.9-3.8z" />
    </svg>
  );
}
