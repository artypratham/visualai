import { cn } from "@/lib/cn";

/** VisualAI mark: a small node-graph inside a rounded tile, hinting at a
 *  network you can see. Pairs with the wordmark. */
export function Logo({ className, withWordmark = true }: { className?: string; withWordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative inline-grid place-items-center">
        <svg
          width="34"
          height="34"
          viewBox="0 0 34 34"
          fill="none"
          aria-hidden
          className="drop-shadow-[0_2px_6px_rgba(98,87,245,0.35)]"
        >
          <defs>
            <linearGradient id="va-grad" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--grad-a)" />
              <stop offset="0.55" stopColor="var(--grad-b)" />
              <stop offset="1" stopColor="var(--grad-c)" />
            </linearGradient>
          </defs>
          <rect width="34" height="34" rx="9" fill="url(#va-grad)" />
          {/* edges */}
          <g stroke="white" strokeOpacity="0.85" strokeWidth="1.4" strokeLinecap="round">
            <line x1="11" y1="10.5" x2="22.5" y2="16" />
            <line x1="11" y1="23.5" x2="22.5" y2="16" />
            <line x1="11" y1="10.5" x2="11" y2="23.5" />
          </g>
          {/* nodes */}
          <g fill="white">
            <circle cx="11" cy="10.5" r="3.1" />
            <circle cx="11" cy="23.5" r="3.1" />
            <circle cx="22.5" cy="16" r="3.6" />
          </g>
        </svg>
      </span>
      {withWordmark && (
        <span className="text-[1.05rem] font-semibold tracking-tight">
          Visual<span className="text-gradient">AI</span>
        </span>
      )}
    </span>
  );
}
