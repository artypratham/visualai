"use client";

import { useMemo, useState } from "react";
import { useThemeColors } from "@/lib/useThemeColors";

type Cat = "people" | "place" | "animal" | "food";
interface Word {
  w: string;
  x: number;
  y: number;
  cat: Cat;
}

// A hand-built 2-D cartoon of an embedding space. Real embeddings live in
// hundreds of dimensions, but the *geometry* — gender as a direction, country->
// capital as a direction, meanings clustering — is exactly this idea.
const WORDS: Word[] = [
  // people / royalty — "female" is +2 on y, consistently
  { w: "man", x: 2, y: 2, cat: "people" },
  { w: "woman", x: 2, y: 4, cat: "people" },
  { w: "king", x: 5, y: 2, cat: "people" },
  { w: "queen", x: 5, y: 4, cat: "people" },
  { w: "prince", x: 7, y: 1.6, cat: "people" },
  { w: "princess", x: 7, y: 3.6, cat: "people" },
  { w: "uncle", x: 9, y: 2, cat: "people" },
  { w: "aunt", x: 9, y: 4, cat: "people" },
  { w: "boy", x: 3.5, y: 1.2, cat: "people" },
  { w: "girl", x: 3.5, y: 3.2, cat: "people" },
  { w: "actor", x: 10.5, y: 1.6, cat: "people" },
  { w: "actress", x: 10.5, y: 3.6, cat: "people" },
  // geography — "capital" is +2 on y from its country
  { w: "france", x: 13, y: 1, cat: "place" },
  { w: "paris", x: 13, y: 3, cat: "place" },
  { w: "italy", x: 15, y: 1, cat: "place" },
  { w: "rome", x: 15, y: 3, cat: "place" },
  { w: "japan", x: 17, y: 1, cat: "place" },
  { w: "tokyo", x: 17, y: 3, cat: "place" },
  { w: "spain", x: 19, y: 1, cat: "place" },
  { w: "madrid", x: 19, y: 3, cat: "place" },
  { w: "germany", x: 13, y: 5, cat: "place" },
  { w: "berlin", x: 13, y: 7, cat: "place" },
  { w: "england", x: 15, y: 5, cat: "place" },
  { w: "london", x: 15, y: 7, cat: "place" },
  // animals cluster
  { w: "dog", x: 3, y: 9, cat: "animal" },
  { w: "puppy", x: 3.4, y: 9.7, cat: "animal" },
  { w: "cat", x: 4.2, y: 9.1, cat: "animal" },
  { w: "kitten", x: 4.6, y: 9.8, cat: "animal" },
  { w: "wolf", x: 5.3, y: 9.5, cat: "animal" },
  { w: "horse", x: 6, y: 9, cat: "animal" },
  { w: "lion", x: 7, y: 9.4, cat: "animal" },
  { w: "tiger", x: 7.6, y: 9.6, cat: "animal" },
  // food cluster
  { w: "apple", x: 11, y: 9, cat: "food" },
  { w: "banana", x: 12, y: 9.3, cat: "food" },
  { w: "cheese", x: 13, y: 8.5, cat: "food" },
  { w: "bread", x: 13.4, y: 9.5, cat: "food" },
  { w: "pizza", x: 14.4, y: 9, cat: "food" },
  { w: "coffee", x: 15.4, y: 9.4, cat: "food" },
];

const byName = Object.fromEntries(WORDS.map((d) => [d.w, d]));
const W = 680;
const H = 460;
const PAD = 44;
const minX = Math.min(...WORDS.map((d) => d.x)) - 1;
const maxX = Math.max(...WORDS.map((d) => d.x)) + 1;
const minY = Math.min(...WORDS.map((d) => d.y)) - 1;
const maxY = Math.max(...WORDS.map((d) => d.y)) + 1;
const mapX = (x: number) => PAD + ((x - minX) / (maxX - minX)) * (W - 2 * PAD);
const mapY = (y: number) => H - PAD - ((y - minY) / (maxY - minY)) * (H - 2 * PAD);
const dist = (a: Word, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

const PRESETS: [string, string, string][] = [
  ["man", "king", "woman"],
  ["france", "paris", "italy"],
  ["man", "woman", "king"],
  ["japan", "tokyo", "france"],
];

export function EmbeddingSpace() {
  const [a, setA] = useState("man");
  const [b, setB] = useState("king");
  const [cc, setCc] = useState("woman");
  const [hovered, setHovered] = useState<string | null>(null);

  const colors = useThemeColors({ people: "--accent", place: "--teal", animal: "--rose", food: "--amber" });
  const catColor = (c: Cat) => colors[c] || "var(--muted)";

  // analogy: A is to B as C is to D, where D = B - A + C
  const target = useMemo(() => {
    const A = byName[a];
    const B = byName[b];
    const C = byName[cc];
    return { x: B.x - A.x + C.x, y: B.y - A.y + C.y };
  }, [a, b, cc]);

  const answer = useMemo(() => {
    let best: Word | null = null;
    let bestD = Infinity;
    for (const d of WORDS) {
      if (d.w === a || d.w === b || d.w === cc) continue;
      const dd = dist(d, target);
      if (dd < bestD) {
        bestD = dd;
        best = d;
      }
    }
    return best;
  }, [target, a, b, cc]);

  const neighbors = useMemo(() => {
    if (!hovered) return new Set<string>();
    const h = byName[hovered];
    return new Set(
      WORDS.filter((d) => d.w !== hovered)
        .map((d) => ({ w: d.w, d: dist(d, h) }))
        .sort((p, q) => p.d - q.d)
        .slice(0, 3)
        .map((n) => n.w),
    );
  }, [hovered]);

  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-2">
        <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full min-w-[600px]">
          <defs>
            <marker id="emb-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
              <path d="M0,0 L9,4.5 L0,9 Z" fill="var(--foreground)" />
            </marker>
          </defs>

          {/* neighbour links on hover */}
          {hovered &&
            [...neighbors].map((n) => (
              <line
                key={`nb${n}`}
                x1={mapX(byName[hovered].x)}
                y1={mapY(byName[hovered].y)}
                x2={mapX(byName[n].x)}
                y2={mapY(byName[n].y)}
                stroke="var(--subtle)"
                strokeWidth={1.5}
                strokeDasharray="3 4"
              />
            ))}

          {/* analogy arrows: A->B and C->D (parallel) */}
          <line x1={mapX(byName[a].x)} y1={mapY(byName[a].y)} x2={mapX(byName[b].x)} y2={mapY(byName[b].y)} stroke="var(--foreground)" strokeWidth={2.2} markerEnd="url(#emb-arrow)" opacity={0.55} />
          <line x1={mapX(byName[cc].x)} y1={mapY(byName[cc].y)} x2={mapX(target.x)} y2={mapY(target.y)} stroke="var(--accent)" strokeWidth={2.6} markerEnd="url(#emb-arrow)" />

          {/* predicted point */}
          <circle cx={mapX(target.x)} cy={mapY(target.y)} r={9} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeDasharray="3 3" />

          {/* words */}
          {WORDS.map((d) => {
            const active = d.w === a || d.w === b || d.w === cc;
            const isAnswer = answer?.w === d.w;
            const dim = hovered && d.w !== hovered && !neighbors.has(d.w);
            return (
              <g
                key={d.w}
                style={{ cursor: "pointer", opacity: dim ? 0.3 : 1, transition: "opacity 0.2s" }}
                onMouseEnter={() => setHovered(d.w)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setHovered((h) => (h === d.w ? null : d.w))}
              >
                <circle cx={mapX(d.x)} cy={mapY(d.y)} r={isAnswer ? 6 : 4} fill={catColor(d.cat)} />
                <text
                  x={mapX(d.x) + 7}
                  y={mapY(d.y) + 4}
                  fontSize={13}
                  fontWeight={active || isAnswer ? 700 : 500}
                  fill={isAnswer ? "var(--accent)" : "var(--foreground)"}
                >
                  {d.w}
                </text>
              </g>
            );
          })}
        </svg>
        </div>
      </div>
      <p className="-mt-2 text-center text-xs text-subtle sm:hidden">Swipe the map sideways to explore →</p>

      {/* analogy machine */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="mb-3 text-sm font-medium text-muted">The analogy machine — meaning as arithmetic</p>
        <div className="flex flex-wrap items-center gap-2 text-[0.95rem]">
          <Pick value={a} onChange={setA} />
          <span className="text-muted">is to</span>
          <Pick value={b} onChange={setB} />
          <span className="text-muted">as</span>
          <Pick value={cc} onChange={setCc} />
          <span className="text-muted">is to</span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent-soft px-3 py-1.5 font-semibold text-accent">
            {answer?.w ?? "—"}
          </span>
        </div>
        <p className="mt-3 font-mono text-xs text-subtle">
          {b} − {a} + {cc} = ({target.x.toFixed(1)}, {target.y.toFixed(1)}) → nearest word: <span className="text-accent">{answer?.w}</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map(([pa, pb, pc]) => (
            <button
              key={`${pa}${pb}${pc}`}
              type="button"
              onClick={() => {
                setA(pa);
                setB(pb);
                setCc(pc);
              }}
              className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {pb} − {pa} + {pc}
            </button>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-muted">
        Hover or tap a word to see its nearest neighbours · colours group words by meaning, with no one telling them to
      </p>
    </div>
  );
}

function Pick({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-sm font-medium text-foreground outline-none focus-visible:border-accent"
    >
      {WORDS.map((d) => (
        <option key={d.w} value={d.w}>
          {d.w}
        </option>
      ))}
    </select>
  );
}
