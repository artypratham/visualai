"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Pseudocode / code block for the Under-the-Hood sections. Hand-rolled
 * highlighter (keywords, comments, numbers, strings) — enough for python-ish
 * pseudocode without shipping a syntax-highlighting dependency.
 */

const KEYWORDS = new Set([
  "def", "for", "in", "if", "else", "elif", "return", "while", "not", "and",
  "or", "break", "continue", "range", "len", "max", "min", "sum", "abs",
  "import", "from", "class", "lambda", "None", "True", "False", "new",
]);

function highlight(line: string, key: number): ReactNode {
  const commentIdx = line.indexOf("#");
  const code = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
  const comment = commentIdx >= 0 ? line.slice(commentIdx) : null;

  const parts: ReactNode[] = [];
  // split keeping delimiters; highlight words, numbers, strings
  const tokens = code.split(/(\s+|[()[\]{},:=+\-*/<>!]|"[^"]*"|'[^']*')/g).filter((t) => t !== "" && t !== undefined);
  tokens.forEach((tok, i) => {
    if (KEYWORDS.has(tok)) {
      parts.push(<span key={i} className="text-accent">{tok}</span>);
    } else if (/^["'].*["']$/.test(tok)) {
      parts.push(<span key={i} className="text-teal">{tok}</span>);
    } else if (/^\d+(\.\d+)?$/.test(tok)) {
      parts.push(<span key={i} className="text-rose">{tok}</span>);
    } else {
      parts.push(tok);
    }
  });
  if (comment) parts.push(<span key="c" className="italic text-subtle">{comment}</span>);
  return <span key={key}>{parts}</span>;
}

export function CodeBlock({ code, title }: { code: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const lines = code.replace(/^\n+|\s+$/g, "").split("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-border bg-surface-2/70">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="font-mono text-xs font-medium text-muted">{title ?? "pseudocode"}</span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-subtle transition-colors hover:bg-surface hover:text-foreground"
        >
          {copied ? <Check size={13} className="text-teal" /> : <Copy size={13} />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[0.83rem] leading-[1.7]">
        <code className="font-mono text-foreground/90">
          {lines.map((l, i) => (
            <div key={i} className="whitespace-pre">
              {highlight(l, i)}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
