/** The Bankpad wordmark. Rendered as inline SVG + text so it works in both
 * light and dark, needs no image asset, and stays crisp at every size.
 *
 * The `size` prop scales both the mark and the wordmark together. */
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
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`${dims} inline-flex shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/40`}
        aria-hidden
      >
        <BankIcon />
      </span>
      {showWordmark && (
        <span className={`${textSize} font-bold tracking-tight text-foreground`}>
          Bank<span className="brand-text">pad</span>
        </span>
      )}
    </span>
  );
}

function BankIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[60%]"
    >
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5 10.5V19" />
      <path d="M9 10.5V19" />
      <path d="M15 10.5V19" />
      <path d="M19 10.5V19" />
      <path d="M3 20h18" />
    </svg>
  );
}
