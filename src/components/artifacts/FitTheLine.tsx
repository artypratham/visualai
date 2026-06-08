"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { Slider, StatPill } from "@/components/ui/controls";
import { Button } from "@/components/ui/Button";
import { useThemeColors } from "@/lib/useThemeColors";

const W = 600;
const H = 420;
const padL = 40;
const padR = 18;
const padT = 18;
const padB = 34;
const plotW = W - padL - padR;
const plotH = H - padT - padB;
const RANGE = 10;

interface Pt {
  x: number;
  y: number;
}

// Deterministic noisy-linear data so SSR and client render identically.
function seed(): Pt[] {
  return [
    { x: 0.8, y: 2.4 },
    { x: 1.9, y: 2.6 },
    { x: 2.8, y: 4.1 },
    { x: 3.7, y: 3.5 },
    { x: 4.8, y: 5.6 },
    { x: 5.9, y: 5.0 },
    { x: 6.8, y: 6.9 },
    { x: 7.9, y: 6.6 },
    { x: 9.0, y: 8.2 },
  ];
}

const toPx = (x: number) => padL + (x / RANGE) * plotW;
const toPy = (y: number) => padT + plotH - (y / RANGE) * plotH;

function mse(points: Pt[], w: number, b: number) {
  if (points.length === 0) return 0;
  let s = 0;
  for (const p of points) {
    const e = w * p.x + b - p.y;
    s += e * e;
  }
  return s / points.length;
}

export function FitTheLine() {
  const [points, setPoints] = useState<Pt[]>(seed);
  const [w, setW] = useState(0.2);
  const [b, setB] = useState(5);
  const [lr, setLr] = useState(0.01);
  const [showResiduals, setShowResiduals] = useState(true);
  const [training, setTraining] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const pointsRef = useRef(points);
  pointsRef.current = points;
  const wbRef = useRef({ w, b });
  wbRef.current = { w, b };

  const c = useThemeColors({ accent: "--accent", teal: "--teal", rose: "--rose", grid: "--border" });

  const loss = mse(points, w, b);

  const toData = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * W;
    const sy = ((clientY - rect.top) / rect.height) * H;
    return {
      x: Math.min(RANGE, Math.max(0, ((sx - padL) / plotW) * RANGE)),
      y: Math.min(RANGE, Math.max(0, ((padT + plotH - sy) / plotH) * RANGE)),
    };
  }, []);

  const step = useCallback((rate: number) => {
    const pts = pointsRef.current;
    if (pts.length === 0) return;
    let gw = 0;
    let gb = 0;
    const { w: cw, b: cb } = wbRef.current;
    for (const p of pts) {
      const e = cw * p.x + cb - p.y;
      gw += e * p.x;
      gb += e;
    }
    gw = (2 / pts.length) * gw;
    gb = (2 / pts.length) * gb;
    const nw = cw - rate * gw;
    const nb = cb - rate * gb;
    setW(nw);
    setB(nb);
    setHistory((h) => [...h.slice(-79), mse(pts, nw, nb)]);
  }, []);

  // Training loop
  useEffect(() => {
    if (!training) return;
    let raf = 0;
    let count = 0;
    const tick = () => {
      step(lr);
      count++;
      const { w: cw } = wbRef.current;
      if (count > 600 || Math.abs(cw) > 50) {
        setTraining(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [training, lr, step]);

  // Point drag
  useEffect(() => {
    if (dragIdx === null) return;
    const move = (e: PointerEvent) => {
      const d = toData(e.clientX, e.clientY);
      setPoints((arr) => arr.map((p, i) => (i === dragIdx ? d : p)));
    };
    const up = () => setDragIdx(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragIdx, toData]);

  const stopAnd = (fn: () => void) => {
    setTraining(false);
    fn();
  };

  // line endpoints clipped to plot
  const lineY0 = b;
  const lineY10 = w * RANGE + b;

  const maxHist = Math.max(...history, 1);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_15rem]">
      <div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-2">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full touch-none"
            onPointerDown={(e) => {
              if (e.target === e.currentTarget || (e.target as Element).getAttribute("data-bg") === "1") {
                stopAnd(() => setPoints((p) => [...p, toData(e.clientX, e.clientY)]));
              }
            }}
          >
            <defs>
              <clipPath id="plot">
                <rect x={padL} y={padT} width={plotW} height={plotH} />
              </clipPath>
            </defs>
            <rect data-bg="1" x={padL} y={padT} width={plotW} height={plotH} rx={8} fill="var(--surface)" />

            {/* gridlines */}
            {Array.from({ length: 6 }, (_, i) => i * 2).map((t) => (
              <g key={t} stroke={c.grid} strokeWidth={1}>
                <line x1={toPx(t)} y1={padT} x2={toPx(t)} y2={padT + plotH} opacity={0.5} />
                <line x1={padL} y1={toPy(t)} x2={padL + plotW} y2={toPy(t)} opacity={0.5} />
              </g>
            ))}

            {/* residuals */}
            {showResiduals &&
              points.map((p, i) => {
                const pred = w * p.x + b;
                return (
                  <line
                    key={`r${i}`}
                    x1={toPx(p.x)}
                    y1={toPy(p.y)}
                    x2={toPx(p.x)}
                    y2={toPy(pred)}
                    stroke={c.rose}
                    strokeWidth={2}
                    opacity={0.45}
                    clipPath="url(#plot)"
                  />
                );
              })}

            {/* fit line */}
            <line
              x1={toPx(0)}
              y1={toPy(lineY0)}
              x2={toPx(RANGE)}
              y2={toPy(lineY10)}
              stroke={c.accent}
              strokeWidth={3.5}
              strokeLinecap="round"
              clipPath="url(#plot)"
            />

            {/* points */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={toPx(p.x)}
                cy={toPy(p.y)}
                r={7}
                fill={c.teal}
                stroke="white"
                strokeWidth={2.5}
                style={{ cursor: "grab" }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  stopAnd(() => setDragIdx(i));
                }}
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute right-3 top-3 rounded-lg border border-border bg-background/85 px-2.5 py-1 font-mono text-xs text-muted backdrop-blur">
            y = {w.toFixed(2)}·x + {b.toFixed(2)}
          </div>
        </div>
        <p className="mt-2.5 text-center text-xs text-muted">
          Drag the teal dots to change the data · click empty space to add one · the purple line is the model&apos;s guess
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2.5">
          <StatPill label="Error (loss)" value={loss.toFixed(2)} accent={c.rose} />
          <StatPill label="Points" value={points.length} />
        </div>

        {/* loss sparkline */}
        <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
          <p className="mb-1 text-[0.7rem] font-medium uppercase tracking-wider text-subtle">Error over time</p>
          <svg viewBox="0 0 100 28" className="h-8 w-full" preserveAspectRatio="none">
            {history.length > 1 && (
              <polyline
                points={history
                  .map((h, i) => `${(i / (history.length - 1)) * 100},${28 - (h / maxHist) * 26 - 1}`)
                  .join(" ")}
                fill="none"
                stroke={c.accent}
                strokeWidth={1.6}
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
        </div>

        <Slider label="Slope (w)" value={w} min={-1} max={3} step={0.01} onChange={(v) => stopAnd(() => setW(v))} format={(v) => v.toFixed(2)} />
        <Slider label="Intercept (b)" value={b} min={-2} max={9} step={0.01} onChange={(v) => stopAnd(() => setB(v))} format={(v) => v.toFixed(2)} />
        <Slider label="Learning rate" value={lr} min={0.002} max={0.04} step={0.001} onChange={setLr} format={(v) => v.toFixed(3)} />

        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => setTraining((t) => !t)}>
            {training ? <Pause size={15} /> : <Play size={15} />}
            {training ? "Pause" : "Train"}
          </Button>
          <Button variant="secondary" size="md" onClick={() => stopAnd(() => step(lr))} aria-label="One step">
            <StepForward size={15} />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            stopAnd(() => {
              setW(0.2);
              setB(5);
              setHistory([]);
            })
          }
        >
          <RotateCcw size={14} /> Reset the line
        </Button>
      </div>
    </div>
  );
}
