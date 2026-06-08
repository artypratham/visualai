import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Centered reading column for lesson prose. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[44rem]", className)}>{children}</div>;
}

/** Wider breakout, for artifacts that want more room than the text column. */
export function Wide({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[52rem]", className)}>{children}</div>;
}

export function Lead({ children }: { children: ReactNode }) {
  return <p className="text-balance text-xl leading-[1.6] text-foreground/80 sm:text-[1.35rem]">{children}</p>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-5 text-[1.0625rem] leading-[1.8] text-foreground/85">{children}</p>;
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-14 scroll-mt-24 text-pretty font-display text-2xl font-medium tracking-tight text-foreground sm:text-[1.75rem]">
      {children}
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-9 text-lg font-semibold tracking-tight text-foreground">{children}</h3>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="mt-5 space-y-2.5 text-[1.0625rem] leading-[1.7] text-foreground/85">{children}</ul>;
}

export function LI({ children }: { children: ReactNode }) {
  return (
    <li className="relative pl-6 before:absolute before:left-1 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent">
      {children}
    </li>
  );
}

export function Strong({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}

export function Em({ children }: { children: ReactNode }) {
  return <em className="font-display italic">{children}</em>;
}

export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
      {children}
    </code>
  );
}

/** A term whose definition appears on hover — name the jargon *after* the intuition. */
export function Term({ children, define }: { children: ReactNode; define: string }) {
  return (
    <span
      title={define}
      className="cursor-help font-medium text-accent decoration-accent/40 decoration-dotted underline-offset-4 [text-decoration-line:underline]"
    >
      {children}
    </span>
  );
}
