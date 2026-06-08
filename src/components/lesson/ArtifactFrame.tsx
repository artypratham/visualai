import type { ReactNode } from "react";
import { Hand } from "lucide-react";
import { cn } from "@/lib/cn";

/** Consistent titled container that signals "this part is interactive". */
export function ArtifactFrame({
  title,
  hint,
  children,
  caption,
  className,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  caption?: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("my-10", className)}>
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-[var(--shadow-md)]">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-b border-border bg-surface-2/60 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-accent-soft text-accent">
              <Hand size={14} strokeWidth={2.2} />
            </span>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
          </div>
          {hint && <p className="text-xs text-muted">{hint}</p>}
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
      {caption && (
        <figcaption className="mx-auto mt-3 max-w-prose text-center text-sm leading-relaxed text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
