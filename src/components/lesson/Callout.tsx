import type { ReactNode } from "react";
import { Lightbulb, MousePointerClick, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "key" | "try" | "recap";

const config: Record<Tone, { icon: LucideIcon; label: string; color: string; soft: string }> = {
  key: { icon: Lightbulb, label: "Key idea", color: "var(--accent)", soft: "var(--accent-soft)" },
  try: { icon: MousePointerClick, label: "Try this", color: "var(--teal)", soft: "var(--teal-soft)" },
  recap: { icon: Sparkles, label: "The payoff", color: "var(--rose)", soft: "var(--rose-soft)" },
};

export function Callout({ tone, title, children }: { tone: Tone; title?: string; children: ReactNode }) {
  const { icon: Icon, label, color, soft } = config[tone];
  return (
    <div
      className="mt-8 overflow-hidden rounded-2xl border bg-surface"
      style={{ borderColor: `color-mix(in srgb, ${color} 35%, var(--border))` }}
    >
      <div className="flex items-center gap-2.5 px-5 py-3" style={{ background: soft }}>
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white"
          style={{ background: color }}
        >
          <Icon size={15} strokeWidth={2.4} />
        </span>
        <span className="text-sm font-semibold tracking-tight" style={{ color }}>
          {title ?? label}
        </span>
      </div>
      <div className="px-5 py-4 text-[1rem] leading-[1.7] text-foreground/85 [&>p:first-child]:mt-0 [&>p]:mt-3">
        {children}
      </div>
    </div>
  );
}
