"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Eraser, Shuffle } from "lucide-react";
import { Slider, SegmentedControl, StatPill } from "@/components/ui/controls";
import { useThemeColors } from "@/lib/useThemeColors";
import { Button } from "@/components/ui/Button";

type Label = "A" | "B";
interface Pt {
  x: number; // normalized 0..1
  y: number;
  label: Label;
}

const W = 1000;
const H = 667;
const FIELD_W = 130;
const FIELD_H = 87;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}
function blob(cx: number, cy: number, n: number, spread: number, label: Label): Pt[] {
  return Array.from({ length: n }, () => ({
    x: Math.min(0.97, Math.max(0.03, cx + rand(-spread, spread))),
    y: Math.min(0.97, Math.max(0.03, cy + rand(-spread, spread))),
    label,
  }));
}

// Deterministic starter set (no Math.random) so server and client render
// identically — random presets only kick in after a user interaction.
const INITIAL: Pt[] = [
  { x: 0.22, y: 0.55, label: "A" },
  { x: 0.3, y: 0.66, label: "A" },
  { x: 0.36, y: 0.58, label: "A" },
  { x: 0.26, y: 0.72, label: "A" },
  { x: 0.33, y: 0.49, label: "A" },
  { x: 0.42, y: 0.68, label: "A" },
  { x: 0.24, y: 0.62, label: "A" },
  { x: 0.66, y: 0.3, label: "B" },
  { x: 0.74, y: 0.4, label: "B" },
  { x: 0.8, y: 0.33, label: "B" },
  { x: 0.7, y: 0.46, label: "B" },
  { x: 0.78, y: 0.27, label: "B" },
  { x: 0.64, y: 0.42, label: "B" },
  { x: 0.82, y: 0.45, label: "B" },
];

const presets: (() => Pt[])[] = [
  // Two blobs
  () => [...blob(0.3, 0.62, 7, 0.1, "A"), ...blob(0.72, 0.36, 7, 0.1, "B")],
  // Island: B surrounds A (nonlinear)
  () => [
    ...blob(0.5, 0.5, 6, 0.07, "A"),
    ...Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return { x: 0.5 + Math.cos(a) * 0.34, y: 0.5 + Math.sin(a) * 0.34, label: "B" as Label };
    }),
  ],
  // Quadrants (XOR-like)
  () => [
    ...blob(0.27, 0.27, 4, 0.07, "A"),
    ...blob(0.73, 0.73, 4, 0.07, "A"),
    ...blob(0.73, 0.27, 4, 0.07, "B"),
    ...blob(0.27, 0.73, 4, 0.07, "B"),
  ],
];

function knn(px: number, py: number, pts: Pt[], k: number) {
  if (pts.length === 0) return null;
  const near = pts
    .map((p) => ({ d: (p.x - px) ** 2 + (p.y - py) ** 2, label: p.label }))
    .sort((a, b) => a.d - b.d)
    .slice(0, Math.min(k, pts.length));
  let a = 0;
  for (const n of near) if (n.label === "A") a++;
  const b = near.length - a;
  const label: Label = a >= b ? "A" : "B";
  return { label, conf: Math.max(a, b) / near.length };
}

export function TeachTheMachine() {
  const [points, setPoints] = useState<Pt[]>(INITIAL);
  const [placing, setPlacing] = useState<Label>("A");
  const [k, setK] = useState(3);
  const [showField, setShowField] = useState(true);
  const [mystery, setMystery] = useState<{ x: number; y: number } | null>({ x: 0.52, y: 0.46 });
  const [dragging, setDragging] = useState(false);
  const [presetIdx, setPresetIdx] = useState(0);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const c = useThemeColors({ teal: "--teal", rose: "--rose" });

  const counts = useMemo(() => {
    let a = 0;
    for (const p of points) if (p.label === "A") a++;
    return { a, b: points.length - a };
  }, [points]);

  const toNorm = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
    };
  }, []);

  // Decision field
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !c.teal) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, FIELD_W, FIELD_H);
    if (!showField || points.length === 0) return;
    for (let j = 0; j < FIELD_H; j++) {
      for (let i = 0; i < FIELD_W; i++) {
        const res = knn((i + 0.5) / FIELD_W, (j + 0.5) / FIELD_H, points, k);
        if (!res) continue;
        ctx.globalAlpha = 0.1 + ((res.conf - 0.5) / 0.5) * 0.34;
        ctx.fillStyle = res.label === "A" ? c.teal : c.rose;
        ctx.fillRect(i, j, 1, 1);
      }
    }
    ctx.globalAlpha = 1;
  }, [points, k, showField, c.teal, c.rose]);

  // Mystery drag
  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => setMystery(toNorm(e.clientX, e.clientY));
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, toNorm]);

  const addPoint = (e: React.PointerEvent) => {
    const n = toNorm(e.clientX, e.clientY);
    setPoints((p) => [...p, { ...n, label: placing }]);
  };

  const prediction = mystery ? knn(mystery.x, mystery.y, points, k) : null;
  const neighbors = useMemo(() => {
    if (!mystery || points.length === 0) return [];
    return points
      .map((p, idx) => ({ idx, d: (p.x - mystery.x) ** 2 + (p.y - mystery.y) ** 2, p }))
      .sort((a, b) => a.d - b.d)
      .slice(0, Math.min(k, points.length));
  }, [mystery, points, k]);

  return (
    <div className="w-full">
      <div className="grid gap-5 lg:grid-cols-[1fr_15rem]">
        {/* Stage */}
        <div className="relative">
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-border bg-surface-2">
            <canvas
              ref={canvasRef}
              width={FIELD_W}
              height={FIELD_H}
              className="absolute inset-0 h-full w-full"
              style={{ imageRendering: "auto" }}
            />
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className="absolute inset-0 h-full w-full touch-none"
              style={{ cursor: "crosshair" }}
            >
              <rect x={0} y={0} width={W} height={H} fill="transparent" onPointerDown={addPoint} />

              {/* neighbor links */}
              {mystery &&
                neighbors.map((n) => (
                  <line
                    key={`l${n.idx}`}
                    x1={mystery.x * W}
                    y1={mystery.y * H}
                    x2={n.p.x * W}
                    y2={n.p.y * H}
                    stroke={n.p.label === "A" ? c.teal : c.rose}
                    strokeWidth={2}
                    strokeDasharray="5 6"
                    opacity={0.6}
                  />
                ))}

              {/* training points */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x * W}
                  cy={p.y * H}
                  r={11}
                  fill={p.label === "A" ? c.teal : c.rose}
                  stroke="white"
                  strokeWidth={2.5}
                  style={{ cursor: "pointer" }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setPoints((arr) => arr.filter((_, idx) => idx !== i));
                  }}
                >
                  <title>Click to remove this example</title>
                </circle>
              ))}

              {/* mystery point */}
              {mystery && (
                <g
                  style={{ cursor: dragging ? "grabbing" : "grab" }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setDragging(true);
                  }}
                >
                  <circle cx={mystery.x * W} cy={mystery.y * H} r={20} fill="none" stroke={prediction ? (prediction.label === "A" ? c.teal : c.rose) : "var(--subtle)"} strokeWidth={3} />
                  <circle cx={mystery.x * W} cy={mystery.y * H} r={7} fill="var(--foreground)" />
                  <circle cx={mystery.x * W} cy={mystery.y * H} r={28} fill="transparent" />
                </g>
              )}
            </svg>

            {/* prediction badge */}
            {mystery && prediction && (
              <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full border border-border bg-background/85 px-3 py-1.5 text-xs font-medium backdrop-blur">
                <span className="text-muted">Mystery point →</span>
                <span style={{ color: prediction.label === "A" ? c.teal : c.rose }} className="font-semibold">
                  Class {prediction.label}
                </span>
                <span className="text-subtle">({Math.round(prediction.conf * 100)}%)</span>
              </div>
            )}
          </div>
          <p className="mt-2.5 text-center text-xs text-muted">
            Click empty space to drop a <span className="font-medium" style={{ color: placing === "A" ? c.teal : c.rose }}>Class {placing}</span> example · drag the ringed dot to test · click a dot to delete it
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-muted">Placing examples</p>
            <SegmentedControl<Label>
              value={placing}
              onChange={setPlacing}
              className="w-full [&>button]:flex-1"
              options={[
                { value: "A", label: <span className="flex items-center justify-center gap-1.5"><Dot color={c.teal} /> Class A</span> },
                { value: "B", label: <span className="flex items-center justify-center gap-1.5"><Dot color={c.rose} /> Class B</span> },
              ]}
            />
          </div>

          <Slider
            label="Neighbors to ask (k)"
            value={k}
            min={1}
            max={15}
            step={2}
            onChange={(v) => setK(Math.round(v))}
          />

          <div className="grid grid-cols-2 gap-2.5">
            <StatPill label="Class A" value={counts.a} accent={c.teal} />
            <StatPill label="Class B" value={counts.b} accent={c.rose} />
          </div>

          <button
            type="button"
            onClick={() => setShowField((s) => !s)}
            className="flex items-center justify-between rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-border-strong"
          >
            Show what it learned
            <span className={`relative h-5 w-9 rounded-full transition-colors ${showField ? "bg-accent" : "bg-border-strong"}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${showField ? "left-[1.125rem]" : "left-0.5"}`} />
            </span>
          </button>

          <div className="mt-auto flex flex-col gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const next = (presetIdx + 1) % presets.length;
                setPresetIdx(next);
                setPoints(presets[next]());
              }}
            >
              <Shuffle size={15} /> New example set
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setPoints([])}>
              <Eraser size={15} /> Clear all
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color || "currentColor" }} />;
}
