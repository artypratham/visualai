"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Slider, SegmentedControl, StatPill } from "@/components/ui/controls";
import { Button } from "@/components/ui/Button";
import { useThemeColors } from "@/lib/useThemeColors";

const S = 440;
const FN = 90; // field resolution

interface Pt {
  x1: number;
  x2: number;
  label: 0 | 1;
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
const toX = (x1: number) => ((x1 + 1) / 2) * S;
const toY = (x2: number) => S - ((x2 + 1) / 2) * S;

function hexRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return [128, 128, 128];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Deterministic two clusters so SSR and client render identically.
function seedPoints(): Pt[] {
  return [
    { x1: 0.4, x2: 0.5, label: 1 },
    { x1: 0.52, x2: 0.42, label: 1 },
    { x1: 0.46, x2: 0.62, label: 1 },
    { x1: 0.6, x2: 0.5, label: 1 },
    { x1: 0.36, x2: 0.4, label: 1 },
    { x1: 0.56, x2: 0.66, label: 1 },
    { x1: -0.4, x2: -0.5, label: 0 },
    { x1: -0.52, x2: -0.42, label: 0 },
    { x1: -0.46, x2: -0.62, label: 0 },
    { x1: -0.6, x2: -0.5, label: 0 },
    { x1: -0.36, x2: -0.4, label: 0 },
    { x1: -0.56, x2: -0.66, label: 0 },
  ];
}

export function NeuronPlayground() {
  const [w1, setW1] = useState(1.2);
  const [w2, setW2] = useState(0.8);
  const [b, setB] = useState(0);
  const [act, setAct] = useState<"sigmoid" | "step">("sigmoid");
  const [test, setTest] = useState({ x1: 0.3, x2: -0.25 });
  const [dragging, setDragging] = useState(false);
  const [points] = useState<Pt[]>(seedPoints);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const c = useThemeColors({ teal: "--teal", rose: "--rose", accent: "--accent" });

  const activate = useCallback((z: number) => (act === "step" ? (z > 0 ? 1 : 0) : sigmoid(z)), [act]);

  // Field
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !c.teal) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const teal = hexRgb(c.teal);
    const rose = hexRgb(c.rose);
    const img = ctx.createImageData(FN, FN);
    for (let j = 0; j < FN; j++) {
      for (let i = 0; i < FN; i++) {
        const x1 = (i / (FN - 1)) * 2 - 1;
        const x2 = (1 - j / (FN - 1)) * 2 - 1;
        const out = activate(w1 * x1 + w2 * x2 + b);
        const idx = (j * FN + i) * 4;
        img.data[idx] = rose[0] + (teal[0] - rose[0]) * out;
        img.data[idx + 1] = rose[1] + (teal[1] - rose[1]) * out;
        img.data[idx + 2] = rose[2] + (teal[2] - rose[2]) * out;
        img.data[idx + 3] = 120;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [w1, w2, b, act, activate, c.teal, c.rose]);

  // Test point drag
  const toDomain = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * S;
    const sy = ((clientY - rect.top) / rect.height) * S;
    return {
      x1: Math.min(1, Math.max(-1, (sx / S) * 2 - 1)),
      x2: Math.min(1, Math.max(-1, (1 - sy / S) * 2 - 1)),
    };
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => setTest(toDomain(e.clientX, e.clientY));
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, toDomain]);

  const z = w1 * test.x1 + w2 * test.x2 + b;
  const out = activate(z);
  const testClass = out >= 0.5 ? 1 : 0;

  const accuracy = useMemo(() => {
    let correct = 0;
    for (const p of points) {
      const o = activate(w1 * p.x1 + w2 * p.x2 + b);
      if ((o >= 0.5 ? 1 : 0) === p.label) correct++;
    }
    return Math.round((correct / points.length) * 100);
  }, [points, w1, w2, b, activate]);

  // boundary endpoints (clipped by box)
  const boundary = useMemo(() => {
    const big = 4;
    if (Math.abs(w2) >= Math.abs(w1)) {
      if (Math.abs(w2) < 1e-6) return null;
      return {
        a: { x1: -big, x2: -(w1 * -big + b) / w2 },
        b: { x1: big, x2: -(w1 * big + b) / w2 },
      };
    }
    if (Math.abs(w1) < 1e-6) return null;
    return {
      a: { x1: -(w2 * -big + b) / w1, x2: -big },
      b: { x1: -(w2 * big + b) / w1, x2: big },
    };
  }, [w1, w2, b]);

  // weight vector (normalized to a fixed display length)
  const mag = Math.hypot(w1, w2) || 1;
  const vec = { x1: (w1 / mag) * 0.55, x2: (w2 / mag) * 0.55 };

  const num = (v: number) => (v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2));

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_15rem]">
      <div>
        <div className="relative mx-auto aspect-square w-full max-w-[440px] overflow-hidden rounded-2xl border border-border bg-surface-2">
          <canvas ref={canvasRef} width={FN} height={FN} className="absolute inset-0 h-full w-full" />
          <svg ref={svgRef} viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 h-full w-full touch-none">
            <defs>
              <clipPath id="box">
                <rect x={0} y={0} width={S} height={S} />
              </clipPath>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill={c.accent} />
              </marker>
            </defs>

            {/* axes */}
            <line x1={toX(0)} y1={0} x2={toX(0)} y2={S} stroke="var(--border)" strokeWidth={1} />
            <line x1={0} y1={toY(0)} x2={S} y2={toY(0)} stroke="var(--border)" strokeWidth={1} />

            {/* boundary */}
            {boundary && (
              <line
                x1={toX(boundary.a.x1)}
                y1={toY(boundary.a.x2)}
                x2={toX(boundary.b.x1)}
                y2={toY(boundary.b.x2)}
                stroke="var(--foreground)"
                strokeWidth={2.5}
                strokeDasharray="2 7"
                strokeLinecap="round"
                clipPath="url(#box)"
                opacity={0.65}
              />
            )}

            {/* weight vector */}
            <line
              x1={toX(0)}
              y1={toY(0)}
              x2={toX(vec.x1)}
              y2={toY(vec.x2)}
              stroke={c.accent}
              strokeWidth={3}
              markerEnd="url(#arrow)"
            />

            {/* example points */}
            {points.map((p, i) => {
              const o = activate(w1 * p.x1 + w2 * p.x2 + b);
              const ok = (o >= 0.5 ? 1 : 0) === p.label;
              return (
                <circle
                  key={i}
                  cx={toX(p.x1)}
                  cy={toY(p.x2)}
                  r={8}
                  fill={p.label === 1 ? c.teal : c.rose}
                  stroke={ok ? "white" : "var(--foreground)"}
                  strokeWidth={ok ? 2.5 : 3}
                  strokeDasharray={ok ? undefined : "3 2"}
                />
              );
            })}

            {/* test point */}
            <g style={{ cursor: dragging ? "grabbing" : "grab" }} onPointerDown={() => setDragging(true)}>
              <circle cx={toX(test.x1)} cy={toY(test.x2)} r={26} fill="transparent" />
              <circle cx={toX(test.x1)} cy={toY(test.x2)} r={15} fill="none" stroke={testClass === 1 ? c.teal : c.rose} strokeWidth={3} />
              <circle cx={toX(test.x1)} cy={toY(test.x2)} r={5} fill="var(--foreground)" />
            </g>
          </svg>
        </div>
        <p className="mt-2.5 text-center text-xs text-muted">
          Dashed line = the neuron&apos;s decision boundary · arrow = the weight direction · drag the ring to test a point
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <Slider label="Weight w₁" value={w1} min={-3} max={3} step={0.01} onChange={setW1} format={(v) => v.toFixed(2)} />
        <Slider label="Weight w₂" value={w2} min={-3} max={3} step={0.01} onChange={setW2} format={(v) => v.toFixed(2)} />
        <Slider label="Bias b" value={b} min={-3} max={3} step={0.01} onChange={setB} format={(v) => v.toFixed(2)} accent="rose" />

        <div>
          <p className="mb-2 text-sm font-medium text-muted">Activation</p>
          <SegmentedControl
            value={act}
            onChange={setAct}
            className="w-full [&>button]:flex-1"
            options={[
              { value: "sigmoid", label: "Sigmoid" },
              { value: "step", label: "Step" },
            ]}
          />
        </div>

        {/* live equation */}
        <div className="rounded-xl border border-border bg-surface px-3.5 py-3 font-mono text-xs leading-relaxed">
          <p className="text-subtle">z = w₁·x₁ + w₂·x₂ + b</p>
          <p className="mt-1 text-muted">
            z = {num(w1)}·{test.x1.toFixed(2)} {num(w2)}·{test.x2.toFixed(2)} {num(b)}
          </p>
          <p className="mt-1 text-foreground">
            = <span style={{ color: c.accent }}>{z.toFixed(2)}</span> → output{" "}
            <span style={{ color: testClass === 1 ? c.teal : c.rose }}>{out.toFixed(2)}</span>
          </p>
        </div>

        <StatPill
          label="Dots classified right"
          value={`${accuracy}%`}
          accent={accuracy === 100 ? c.teal : undefined}
        />

        <Button
          variant="ghost"
          size="sm"
          className="mt-auto"
          onClick={() => {
            setW1(1.2);
            setW2(0.8);
            setB(0);
          }}
        >
          <RotateCcw size={14} /> Reset knobs
        </Button>
      </div>
    </div>
  );
}
