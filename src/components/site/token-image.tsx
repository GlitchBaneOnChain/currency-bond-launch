import { Landmark } from "lucide-react";

/** Renders a launch's image whether it was uploaded (data URL / https URL)
 * or is legacy text (a single emoji or a short glyph). Falls back to a bank
 * icon if the field is empty. */
export function TokenImage({
  src,
  className = "",
  alt = "",
  textClassName = "",
}: {
  src: string | null | undefined;
  className?: string;
  alt?: string;
  textClassName?: string;
}) {
  const value = (src ?? "").trim();
  const isUrl = value.startsWith("data:") || value.startsWith("http://") || value.startsWith("https://");

  if (isUrl) {
    return <img src={value} alt={alt} className={`h-full w-full object-cover ${className}`} />;
  }
  if (!value) {
    return <Landmark className={`text-muted-foreground ${textClassName}`} />;
  }
  return <span className={textClassName}>{value}</span>;
}
