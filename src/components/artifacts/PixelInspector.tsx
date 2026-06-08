"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Eraser, Paintbrush, Trash2 } from "lucide-react";
import { SegmentedControl, Slider } from "@/components/ui/controls";
import { Button } from "@/components/ui/Button";

// 12x12 bitmaps — '#' is full ink.
const STAMPS: Record<string, string[]> = {
  "7": [
    "............",
    ".##########.",
    ".##########.",
    "........##..",
    ".......##...",
    "......##....",
    ".....##.....",
    "....##......",
    "....##......",
    "....##......",
    "............",
    "............",
  ],
  "3": [
    "............",
    "..######....",
    ".##....##...",
    ".......##...",
    "....####....",
    "....####....",
    ".......##...",
    ".##....##...",
    ".##....##...",
    "..######....",
    "............",
    "............",
  ],
  "♥": [
    "............",
    "..##....##..",
    ".####..####.",
    ".##########.",
    ".##########.",
    ".##########.",
    "..########..",
    "...######...",
    "....####....",
    ".....##.....",
    "............",
    "............",
  ],
};

function stampToGrid(stamp: string[]): number[] {
  const g: number[] = [];
  for (const row of stamp) for (const ch of row) g.push(ch === "#" ? 1 : 0);
  return g;
}

export function PixelInspector() {
  const [size, setSize] = useState(12);
  const [grid, setGrid] = useState<number[]>(() => stampToGrid(STAMPS["7"]));
  const [view, setView] = useState<"picture" | "numbers">("picture");
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [brush, setBrush] = useState(1.4);
  const [painting, setPainting] = useState(false);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const nonZero = useMemo(() => grid.filter((v) => v > 0.02).length, [grid]);

  const setResolution = (n: number) => {
    setSize(n);
    setGrid(new Array(n * n).fill(0));
  };

  const paintAt = useCallback(
    (clientX: number, clientY: number) => {
      const rect = gridRef.current!.getBoundingClientRect();
      const fx = ((clientX - rect.left) / rect.width) * size;
      const fy = ((clientY - rect.top) / rect.height) * size;
      const R = brush;
      setGrid((prev) => {
        const next = prev.slice();
        const i0 = Math.max(0, Math.floor(fx - R - 1));
        const i1 = Math.min(size - 1, Math.ceil(fx + R));
        const j0 = Math.max(0, Math.floor(fy - R - 1));
        const j1 = Math.min(size - 1, Math.ceil(fy + R));
        for (let j = j0; j <= j1; j++) {
          for (let i = i0; i <= i1; i++) {
            const d = Math.hypot(i + 0.5 - fx, j + 0.5 - fy);
            if (d > R) continue;
            const fall = 1 - d / R;
            const idx = j * size + i;
            if (tool === "brush") next[idx] = Math.min(1, next[idx] + fall * 0.7);
            else next[idx] = Math.max(0, next[idx] - fall * 0.9);
          }
        }
        return next;
      });
    },
    [size, brush, tool],
  );

  useEffect(() => {
    if (!painting) return;
    const move = (e: PointerEvent) => paintAt(e.clientX, e.clientY);
    const up = () => setPainting(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [painting, paintAt]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_15rem]">
      {/* Stage */}
      <div>
        <div
          ref={gridRef}
          onPointerDown={(e) => {
            e.preventDefault();
            setPainting(true);
            paintAt(e.clientX, e.clientY);
          }}
          className="grid aspect-square w-full touch-none select-none gap-px overflow-hidden rounded-2xl border border-border bg-border"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, cursor: tool === "brush" ? "crosshair" : "cell" }}
        >
          {grid.map((v, i) => {
            const val = Math.round(v * 255);
            return (
              <div
                key={i}
                className="relative grid place-items-center transition-colors duration-75"
                style={{ backgroundColor: `color-mix(in srgb, var(--foreground) ${v * 100}%, var(--surface))` }}
              >
                {view === "numbers" && (
                  <span
                    className="font-mono text-[clamp(0.4rem,1.4vw,0.7rem)] tabular-nums"
                    style={{ color: v > 0.55 ? "var(--background)" : v > 0.05 ? "var(--background)" : "var(--subtle)" }}
                  >
                    {val}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Flattened array */}
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-medium text-subtle">
            What the computer actually stores — one long list of {size * size} numbers:
          </p>
          <div className="max-h-24 overflow-y-auto rounded-xl border border-border bg-surface-2 p-3 font-mono text-[0.7rem] leading-relaxed text-muted">
            <span className="text-subtle">[ </span>
            {grid.map((v, i) => {
              const n = Math.round(v * 255);
              return (
                <span key={i} className={n > 0 ? "text-accent" : ""}>
                  {n}
                  {i < grid.length - 1 ? ", " : ""}
                </span>
              );
            })}
            <span className="text-subtle"> ]</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-muted">View</p>
          <SegmentedControl
            value={view}
            onChange={setView}
            className="w-full [&>button]:flex-1"
            options={[
              { value: "picture", label: "Picture" },
              { value: "numbers", label: "Numbers" },
            ]}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-muted">Tool</p>
          <SegmentedControl
            value={tool}
            onChange={setTool}
            className="w-full [&>button]:flex-1"
            options={[
              { value: "brush", label: <span className="flex items-center justify-center gap-1.5"><Paintbrush size={14} /> Draw</span> },
              { value: "eraser", label: <span className="flex items-center justify-center gap-1.5"><Eraser size={14} /> Erase</span> },
            ]}
          />
        </div>

        <Slider label="Brush size" value={brush} min={0.8} max={2.6} step={0.1} onChange={setBrush} format={(v) => v.toFixed(1)} />

        <div>
          <p className="mb-2 text-sm font-medium text-muted">Resolution</p>
          <SegmentedControl
            value={String(size)}
            onChange={(v) => setResolution(parseInt(v))}
            className="w-full [&>button]:flex-1"
            options={[
              { value: "8", label: "8²" },
              { value: "12", label: "12²" },
              { value: "16", label: "16²" },
            ]}
          />
          <p className="mt-1.5 text-xs text-subtle">{nonZero} of {size * size} cells have ink</p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-muted">Stamp a shape</p>
          <div className="flex gap-2">
            {Object.keys(STAMPS).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSize(12);
                  setGrid(stampToGrid(STAMPS[key]));
                }}
                className="grid h-11 flex-1 place-items-center rounded-xl border border-border bg-surface text-lg font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <Button variant="ghost" size="sm" className="mt-auto" onClick={() => setGrid(new Array(size * size).fill(0))}>
          <Trash2 size={15} /> Clear canvas
        </Button>
      </div>
    </div>
  );
}
