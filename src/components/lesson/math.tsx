import katex from "katex";
import { cn } from "@/lib/cn";

/**
 * Server-rendered KaTeX. Lesson bodies are RSC, so the math is rendered to
 * HTML at build time — zero client JS. katex.min.css is imported in the root
 * layout. Write TeX with String.raw to keep backslashes sane.
 */

function render(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex, {
    displayMode,
    throwOnError: false,
    strict: false,
  });
}

/** Block equation, centered, with breathing room. */
export function MathBlock({ tex, className }: { tex: string; className?: string }) {
  return (
    <div
      className={cn("my-5 overflow-x-auto px-1 py-1 text-[1.05rem] text-foreground", className)}
      dangerouslySetInnerHTML={{ __html: render(tex, true) }}
    />
  );
}

/** Inline math, flows with prose. */
export function MathInline({ tex }: { tex: string }) {
  return <span className="text-[0.97em]" dangerouslySetInnerHTML={{ __html: render(tex, false) }} />;
}
