import { Wrench } from "lucide-react";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border-strong bg-surface-2/50 px-6 py-16 text-center">
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-accent-soft text-accent">
        <Wrench size={20} />
      </span>
      <h3 className="font-display text-xl font-medium text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted">
        This interactive is on the workbench. The idea is mapped out — the tinkerable version is coming next.
      </p>
    </div>
  );
}
