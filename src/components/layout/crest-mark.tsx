// TODO(review): placeholder mark (white St Andrew's Cross on blue).
// Replace with the official PCG crest artwork once supplied.
export function CrestMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 48" aria-hidden="true" className={className}>
      <path d="M2 2h36v24c0 11-8 18-18 20C10 44 2 37 2 26V2z" fill="var(--color-brand)" />
      <path
        d="M8 8l24 30M32 8L8 38"
        stroke="var(--color-white)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
