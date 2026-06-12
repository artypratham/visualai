"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, FunctionSquare } from "lucide-react";

/**
 * The "Under the Hood" layer: optional depth at the end of every lesson.
 * Collapsed by default so beginners are never confronted with math —
 * but one click away for engineers who want the gears.
 */
export function AdvancedSection({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-16">
      <div
        className="overflow-hidden rounded-3xl border"
        style={{
          borderColor: open ? "color-mix(in srgb, var(--accent) 45%, var(--border))" : "var(--border)",
          background: open
            ? "linear-gradient(180deg, color-mix(in srgb, var(--accent) 6%, var(--surface)), var(--surface))"
            : "var(--surface)",
          transition: "border-color 0.3s",
        }}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-7"
        >
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-[var(--shadow-sm)]"
            style={{ background: "linear-gradient(135deg, var(--grad-a), var(--grad-b))" }}
          >
            <FunctionSquare size={20} />
          </span>
          <span className="flex-1">
            <span className="block font-display text-xl font-medium tracking-tight text-foreground">
              Under the Hood
            </span>
            <span className="mt-0.5 block text-sm text-muted">
              The real math and the actual code — optional, for when intuition isn&apos;t enough.
            </span>
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted"
          >
            <ChevronDown size={16} />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="border-t border-border px-5 pb-7 pt-1 sm:px-7 [&>p:first-of-type]:mt-4">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/** Subhead inside the advanced section. */
export function AdvH({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-8 flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
      <span className="inline-block h-4 w-1 rounded-full bg-accent" />
      {children}
    </h3>
  );
}
