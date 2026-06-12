"use client";

import { useMemo, useState } from "react";
import { Slider, SegmentedControl, StatPill } from "@/components/ui/controls";
import { mulberry32, gaussian } from "@/lib/prng";

/**
 * The data-flow X-ray: a real MLP with every activation and gradient visible.
 * Forward mode: pulses carry the signal left→right; node fill = activation.
 * Backward mode: pulses carry blame right→left; node fill = delta (error signal).
 * Click any node to see its exact arithmetic. Deterministic weights → SSR-safe.
 */

const W = 640;
const H = 380;
const r2 = (n: number) => Math.round(n * 100) / 100;
const sig = (z: number) => 1 / (1 + Math.exp(-z));

interface NetworkFlowProps {
  layers?: number[];
}

export function NetworkFlow({ layers = [2, 3, 3, 1] }: NetworkFlowProps) {
  const L = layers.length;

  // deterministic weights/biases
  const { weights, biases } = useMemo(() => {
    const rng = mulberry32(42 + layers.join("").length);
    const ws: number[][][] = [];
    const bs: number[][] = [];
    for (let l = 0; l < L - 1; l++) {
      const scale = Math.sqrt(2 / layers[l]);
      ws.push(
        Array.from({ length: layers[l + 1] }, () =>
          Array.from({ length: layers[l] }, () => r2(gaussian(rng) * scale * 1.1)),
        ),
      );
      bs.push(Array.from({ length: layers[l + 1] }, () => r2(gaussian(rng) * 0.3)));
    }
    return { weights: ws, biases: bs };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers.join(",")]);

  const [inputs, setInputs] = useState<number[]>(() => layers[0] === 2 ? [0.6, -0.4] : Array(layers[0]).fill(0.5));
  const [mode, setMode] = useState<"forward" | "backward">("forward");
  const [target, setTarget] = useState<0 | 1>(1);
  const [selected, setSelected] = useState<{ l: number; j: number } | null>({ l: L - 1, j: 0 });

  // forward pass — activations per layer
  const acts = useMemo(() => {
    const a: number[][] = [inputs.map((v) => r2(v))];
    for (let l = 0; l < L - 1; l++) {
      const out: number[] = [];
      for (let j = 0; j < layers[l + 1]; j++) {
        let z = biases[l][j];
        for (let i = 0; i < layers[l]; i++) z += weights[l][j][i] * a[l][i];
        out.push(r2(l === L - 2 ? sig(z) : Math.tanh(z)));
      }
      a.push(out);
    }
    return a;
  }, [inputs, weights, biases, layers, L]);

  // backward pass — deltas per layer (BCE + sigmoid output, tanh hidden)
  const deltas = useMemo(() => {
    const d: number[][] = Array.from({ length: L }, () => []);
    d[L - 1] = acts[L - 1].map((a) => r2(a - target));
    for (let l = L - 2; l >= 1; l--) {
      d[l] = acts[l].map((a, k) => {
        let s = 0;
        for (let j = 0; j < layers[l + 1]; j++) s += weights[l][j][k] * d[l + 1][j];
        return r2(s * (1 - a * a));
      });
    }
    d[0] = acts[0].map(() => 0);
    return d;
  }, [acts, weights, target, layers, L]);

  const out = acts[L - 1][0];
  const loss = r2(-(target * Math.log(Math.max(1e-6, out)) + (1 - target) * Math.log(Math.max(1e-6, 1 - out))));

  // layout
  const colX = (l: number) => r2(70 + (l * (W - 150)) / (L - 1));
  const nodeY = (l: number, i: number) => {
    const n = layers[l];
    const gap = Math.min(86, (H - 80) / Math.max(1, n - 1) || 0);
    const top = H / 2 - ((n - 1) * gap) / 2;
    return r2(top + i * gap);
  };

  const nodeVal = (l: number, i: number) => (mode === "forward" ? acts[l][i] : deltas[l][i]);
  const nodeColor = (v: number) => (v >= 0 ? "var(--teal)" : "var(--rose)");

  const fwd = mode === "forward";
  const pulseColor = fwd ? "var(--accent)" : "var(--rose)";

  const sel = selected;
  const selIsInput = sel && sel.l === 0;

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          value={mode}
          onChange={(m) => setMode(m)}
          options={[
            { value: "forward", label: "Forward — data flows" },
            { value: "backward", label: "Backward — blame flows" },
          ]}
        />
        {!fwd && (
          <SegmentedControl
            value={String(target)}
            onChange={(v) => setTarget(parseInt(v) as 0 | 1)}
            options={[
              { value: "1", label: "target y = 1" },
              { value: "0", label: "target y = 0" },
            ]}
          />
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {/* edges with traveling pulses */}
          {weights.map((wl, l) =>
            wl.map((row, j) =>
              row.map((w, i) => {
                const x1 = colX(l);
                const y1 = nodeY(l, i);
                const x2 = colX(l + 1);
                const y2 = nodeY(l + 1, j);
                const grad = deltas[l + 1][j] * acts[l][i];
                const mag = fwd ? Math.abs(w) : Math.abs(grad);
                const sign = fwd ? w : grad;
                // pulse travels start -> end via CSS keyframes (SMIL stalls some capture pipelines)
                const [sx, sy, ex, ey] = fwd ? [x1, y1, x2, y2] : [x2, y2, x1, y1];
                const delay = (fwd ? l : L - 2 - l) * 1.1 + (i + j) * 0.07;
                return (
                  <g key={`${l}-${j}-${i}`}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={sign >= 0 ? "var(--teal)" : "var(--rose)"}
                      strokeWidth={Math.min(5, 0.8 + mag * (fwd ? 2.2 : 6))}
                      opacity={0.3}
                    />
                    <circle
                      cx={sx}
                      cy={sy}
                      r={3}
                      fill={pulseColor}
                      style={
                        {
                          "--dx": `${r2(ex - sx)}px`,
                          "--dy": `${r2(ey - sy)}px`,
                          animation: "net-pulse 1.1s linear infinite",
                          animationDelay: `${delay.toFixed(2)}s`,
                        } as React.CSSProperties
                      }
                    />
                  </g>
                );
              }),
            ),
          )}

          {/* nodes */}
          {layers.map((n, l) =>
            Array.from({ length: n }, (_, i) => {
              const v = nodeVal(l, i);
              const active = sel && sel.l === l && sel.j === i;
              return (
                <g
                  key={`n${l}-${i}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelected({ l, j: i })}
                >
                  <circle
                    cx={colX(l)}
                    cy={nodeY(l, i)}
                    r={24}
                    fill={`color-mix(in srgb, ${nodeColor(v)} ${Math.min(85, Math.abs(v) * 85)}%, var(--surface))`}
                    stroke={active ? "var(--accent)" : "var(--border-strong)"}
                    strokeWidth={active ? 3 : 1.5}
                  />
                  <text
                    x={colX(l)}
                    y={nodeY(l, i) + 4}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={600}
                    fontFamily="var(--font-mono)"
                    fill="var(--foreground)"
                  >
                    {v.toFixed(2)}
                  </text>
                </g>
              );
            }),
          )}

          {/* layer labels */}
          {layers.map((_, l) => (
            <text key={`lab${l}`} x={colX(l)} y={H - 12} textAnchor="middle" fontSize={11} fill="var(--subtle)">
              {l === 0 ? "input" : l === L - 1 ? "output" : `hidden ${l}`}
            </text>
          ))}
        </svg>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[15rem_1fr]">
        <div className="flex flex-col gap-3">
          {inputs.map((v, i) => (
            <Slider
              key={i}
              label={`input x${i + 1}`}
              value={v}
              min={-1}
              max={1}
              step={0.05}
              onChange={(nv) => setInputs((arr) => arr.map((o, j) => (j === i ? nv : o)))}
              format={(n) => n.toFixed(2)}
            />
          ))}
          <div className="grid grid-cols-2 gap-2">
            <StatPill label="output ŷ" value={out.toFixed(3)} accent="var(--teal)" />
            <StatPill label="loss" value={loss.toFixed(3)} accent="var(--rose)" />
          </div>
        </div>

        {/* arithmetic panel for the selected node */}
        <div className="rounded-xl border border-border bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-muted">
          {sel === null ? (
            <p>Click any node to see its exact arithmetic.</p>
          ) : selIsInput ? (
            <p>
              <span className="text-foreground">x{sel.j + 1} = {acts[0][sel.j].toFixed(2)}</span> — an input. You set
              it with the slider; in a real model this would be a pixel value or a token embedding.
            </p>
          ) : fwd ? (
            <>
              <p className="text-subtle"># node: {sel.l === L - 1 ? "output" : `hidden ${sel.l}`} · unit {sel.j + 1} — weighted sum, then squash</p>
              <p className="mt-1 text-foreground">
                z ={" "}
                {weights[sel.l - 1][sel.j]
                  .map((w, i) => `${w >= 0 && i > 0 ? "+" : ""}${w.toFixed(2)}·${acts[sel.l - 1][i].toFixed(2)}`)
                  .join(" ")}{" "}
                {biases[sel.l - 1][sel.j] >= 0 ? "+" : ""}
                {biases[sel.l - 1][sel.j].toFixed(2)}
              </p>
              <p className="mt-1">
                a = {sel.l === L - 1 ? "σ(z)" : "tanh(z)"} ={" "}
                <span style={{ color: nodeColor(acts[sel.l][sel.j]) }}>{acts[sel.l][sel.j].toFixed(3)}</span>
              </p>
            </>
          ) : (
            <>
              <p className="text-subtle"># node: {sel.l === L - 1 ? "output" : `hidden ${sel.l}`} · unit {sel.j + 1} — its share of the blame</p>
              {sel.l === L - 1 ? (
                <p className="mt-1 text-foreground">
                  δ = ŷ − y = {out.toFixed(3)} − {target} ={" "}
                  <span style={{ color: nodeColor(deltas[sel.l][sel.j]) }}>{deltas[sel.l][sel.j].toFixed(3)}</span>
                </p>
              ) : (
                <p className="mt-1 text-foreground">
                  δ = (Σ w·δ<sub>next</sub>) · (1 − a²) ={" "}
                  <span style={{ color: nodeColor(deltas[sel.l][sel.j]) }}>{deltas[sel.l][sel.j].toFixed(3)}</span>
                </p>
              )}
              <p className="mt-1">
                each incoming weight then moves by −η · δ · a<sub>from</sub> — that&apos;s the gradient-descent nudge.
              </p>
            </>
          )}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-subtle">
        Edge thickness = {fwd ? "weight strength" : "gradient size"} · teal = positive, rose = negative · pulses show the direction of flow
      </p>
    </div>
  );
}
