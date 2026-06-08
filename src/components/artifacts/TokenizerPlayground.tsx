"use client";

import { useMemo, useState } from "react";

// Common whole words (become one token, GPT-style with a leading space),
// plus subword pieces, so unknown words split — e.g. strawberry -> straw + berry.
const COMMON = "the a an of to and in is it was on for you are this that with cat dog sat mat weather today hello world model learn learning language word words number numbers machine reading right now big small why how what they predict next token your i we he she".split(" ");
const PIECES = ["straw", "berry", "token", "ization", "ize", "tion", "ation", "ing", "ned", "ed", "ly", "ers", "er", "ness", "ment", "able", "anti", "super", "cali", "frag", "ilis", "tic", "ous", "al", "ic", "ph", "one", "aut", "omat", "un", "re", "pre"];
const PUNCT = ".,!?;:'\"-()".split("").concat(["\n", " "]);

const VOCAB: string[] = [];
for (const w of COMMON) {
  VOCAB.push(" " + w, w);
}
VOCAB.push(...PIECES, ...PUNCT);
const VOCAB_SET = new Set(VOCAB);
const VOCAB_INDEX = new Map(VOCAB.map((v, i) => [v, i + 100]));
const MAX_LEN = Math.max(...VOCAB.map((v) => v.length));

interface Tok {
  text: string;
  id: number;
}

function tokenize(text: string): Tok[] {
  const lower = text.toLowerCase();
  const toks: Tok[] = [];
  let i = 0;
  while (i < text.length) {
    let matched = "";
    for (let L = Math.min(MAX_LEN, text.length - i); L >= 1; L--) {
      const piece = lower.slice(i, i + L);
      if (VOCAB_SET.has(piece)) {
        matched = piece;
        break;
      }
    }
    if (matched) {
      toks.push({ text: text.slice(i, i + matched.length), id: VOCAB_INDEX.get(matched) ?? 0 });
      i += matched.length;
    } else {
      const ch = text[i];
      toks.push({ text: ch, id: 1000 + (ch.codePointAt(0) ?? 0) % 900 });
      i += 1;
    }
  }
  return toks;
}

const PRESETS = [
  "strawberry",
  "The cat sat on the mat.",
  "tokenization",
  "supercalifragilistic 🍓",
];

const BG = [
  "color-mix(in srgb, var(--accent) 20%, transparent)",
  "color-mix(in srgb, var(--teal) 24%, transparent)",
  "color-mix(in srgb, var(--rose) 22%, transparent)",
  "color-mix(in srgb, var(--amber) 26%, transparent)",
];

export function TokenizerPlayground() {
  const [text, setText] = useState("strawberry");
  const tokens = useMemo(() => tokenize(text), [text]);

  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        spellCheck={false}
        className="w-full resize-y rounded-2xl border border-border bg-surface px-4 py-3 text-base text-foreground outline-none focus-visible:border-accent"
        placeholder="Type anything…"
      />

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setText(p)}
            className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface-2/50 p-4">
        <div className="flex flex-wrap gap-1.5">
          {tokens.map((t, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-md px-1.5 py-1 font-mono text-sm text-foreground"
              style={{ background: BG[i % BG.length] }}
              title={`token id ${t.id}`}
            >
              {t.text === "\n" ? "⏎" : t.text.startsWith(" ") ? <><span className="text-subtle">·</span>{t.text.slice(1)}</> : t.text}
            </span>
          ))}
          {tokens.length === 0 && <span className="text-sm text-subtle">Type something above…</span>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="text-muted">
          <span className="font-mono text-lg font-semibold text-accent">{tokens.length}</span> tokens
        </span>
        <span className="text-muted">
          <span className="font-mono text-lg font-semibold text-foreground">{[...text].length}</span> characters
        </span>
        <span className="text-xs text-subtle">· APIs bill per token, not per word</span>
      </div>

      <p className="text-xs text-subtle">
        Notice how <span className="font-mono">strawberry</span> splits into <span className="font-mono">straw</span> +{" "}
        <span className="font-mono">berry</span> — the model never sees the letters s-t-r-a-w-b-e-r-r-y in a row, which
        is exactly why it fumbles questions like &ldquo;how many R&apos;s are in strawberry?&rdquo;
      </p>
    </div>
  );
}
