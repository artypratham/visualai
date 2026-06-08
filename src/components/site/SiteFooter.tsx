import Link from "next/link";
import { Logo } from "./Logo";
import { lessons } from "@/lib/curriculum";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            An interactive, visual roadmap for understanding AI from zero — one tinkerable idea at a time.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-subtle">Learn</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {lessons.slice(0, 4).map((l) => (
              <li key={l.slug}>
                <Link href={`/learn/${l.slug}`} className="text-muted transition-colors hover:text-foreground">
                  {l.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/learn" className="font-medium text-accent transition-colors hover:text-accent-hover">
                See the full roadmap →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-subtle">About</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/about" className="text-muted transition-colors hover:text-foreground">
                How it works
              </Link>
            </li>
            <li>
              <span className="text-muted">No account. No tracking. Just learning.</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-subtle sm:flex-row sm:px-8">
          <p>© {new Date().getFullYear()} VisualAI · Built to be understood.</p>
          <p>Made for curious humans.</p>
        </div>
      </div>
    </footer>
  );
}
