/** The Bankpad wordmark. A solid bright-green rounded square holds the
 * classical-bank pediment icon (roof + 4 columns + base), followed by the
 * "Bank" / "pad" wordmark. Rendered as inline SVG + text so it needs no
 * image asset and stays crisp at every size. */
export function BankpadLogo({
  size = "md",
  showWordmark = true,
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
}) {
  const dims = size === "sm" ? "size-7" : size === "lg" ? "size-11" : "size-9";
  const textSize = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";
  const gap = size === "sm" ? "gap-1.5" : "gap-2.5";
  return (
    <span className={`inline-flex items-center ${gap} ${className}`}>
      <span
        className={`${dims} inline-flex shrink-0 items-center justify-center rounded-[22%] bg-primary text-[#03170a]`}
        aria-hidden
      >
        <BankMark />
      </span>
      {showWordmark && (
        <span className={`${textSize} font-extrabold leading-none tracking-tight text-foreground`}>
          Bank<span className="text-primary">pad</span>
        </span>
      )}
    </span>
  );
}

/** Classical-bank pediment: triangular roof, four filled columns, base. */
function BankMark() {
  return (
    <svg viewBox="0 0 32 32" className="size-[68%]" aria-hidden>
      <g fill="currentColor">
        {/* Roof / pediment */}
        <path d="M16 4 L2.6 11.8 A0.7 0.7 0 0 0 3 13 H29 A0.7 0.7 0 0 0 29.4 11.8 Z" />
        {/* Four columns */}
        <rect x="4.6" y="14.4" width="3.4" height="10.6" rx="0.6" />
        <rect x="10.2" y="14.4" width="3.4" height="10.6" rx="0.6" />
        <rect x="15.8" y="14.4" width="3.4" height="10.6" rx="0.6" />
        <rect x="21.4" y="14.4" width="3.4" height="10.6" rx="0.6" />
        {/* Base */}
        <rect x="3" y="26" width="26" height="2.4" rx="0.6" />
      </g>
    </svg>
  );
}
