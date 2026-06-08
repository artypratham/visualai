"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Slider, SegmentedControl, StatPill } from "@/components/ui/controls";
import { Button } from "@/components/ui/Button";
import { useThemeColors } from "@/lib/useThemeColors";
import { mulberry32, gaussian } from "@/lib/prng";

const S = 420;
const FN = 64; // decision-field resolution

type Sample = { x: [number, number]; y: 0 | 1 };
type Dataset = "spiral" | "circle" | "xor" | "blobs";

function hexRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return [128, 128, 128];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function makeData(kind: Dataset, seed: number): Sample[] {
  const rng = mulberry32(seed);
  const pts: Sample[] = [];
  const N = 120;
  if (kind === "spiral") {
    for (let i = 0; i < N / 2; i++) {
      const t = (i / (N / 2)) * 3.2;
      const r = 0.18 + t * 0.24;
      for (const [cls, off] of [[0, 0], [1, Math.PI]] as const) {
        const a = t + off + gaussian(rng) * 0.14;
        pts.push({ x: [r * Math.cos(a), r * Math.sin(a)], y: cls as 0 | 1 });
      }
    }
  } else if (kind === "circle") {
    for (let i = 0; i < N; i++) {
      const x1 = rng() * 2 - 1;
      const x2 = rng() * 2 - 1;
      const inside = x1 * x1 + x2 * x2 < 0.33;
      pts.push({ x: [x1, x2], y: inside ? 1 : 0 });
    }
  } else if (kind === "xor") {
    for (let i = 0; i < N; i++) {
      const x1 = rng() * 1.8 - 0.9;
      const x2 = rng() * 1.8 - 0.9;
      pts.push({ x: [x1, x2], y: x1 * x2 > 0 ? 1 : 0 });
    }
  } else {
    for (let i = 0; i < N; i++) {
      const cls = i % 2;
      const cx = cls ? 0.45 : -0.45;
      const cy = cls ? 0.45 : -0.45;
      pts.push({ x: [cx + gaussian(rng) * 0.18, cy + gaussian(rng) * 0.18], y: cls as 0 | 1 });
    }
  }
  return pts;
}

// --- tiny MLP: 2 -> H -> H -> 1, tanh hidden, sigmoid out, BCE loss ---
type Net = { W: number[][][]; b: number[][] };
const sig = (z: number) => 1 / (1 + Math.exp(-z));

function makeNet(H: number, seed: number): Net {
  const rng = mulberry32(seed);
  const sizes = [2, H, H, 1];
  const W: number[][][] = [];
  const b: number[][] = [];
  for (let l = 0; l < sizes.length - 1; l++) {
    const scale = Math.sqrt(2 / sizes[l]);
    const wl: number[][] = [];
    const bl: number[] = [];
    for (let j = 0; j < sizes[l + 1]; j++) {
      const row: number[] = [];
      for (let k = 0; k < sizes[l]; k++) row.push(gaussian(rng) * scale);
      wl.push(row);
      bl.push(0);
    }
    W.push(wl);
    b.push(bl);
  }
  return { W, b };
}

function forward(net: Net, x: number[]): number[][] {
  const acts: number[][] = [x];
  let a = x;
  for (let l = 0; l < net.W.length; l++) {
    const last = l === net.W.length - 1;
    const out: number[] = [];
    for (let j = 0; j < net.W[l].length; j++) {
      let z = net.b[l][j];
      const wl = net.W[l][j];
      for (let k = 0; k < a.length; k++) z += wl[k] * a[k];
      out.push(last ? sig(z) : Math.tanh(z));
    }
    a = out;
    acts.push(a);
  }
  return acts;
}

function trainEpoch(net: Net, data: Sample[], lr: number) {
  const L = net.W.length;
  const gW = net.W.map((layer) => layer.map((row) => row.map(() => 0)));
  const gB = net.b.map((row) => row.map(() => 0));
  for (const { x, y } of data) {
    const acts = forward(net, x);
    const deltas: number[][] = new Array(L);
    deltas[L - 1] = [acts[L][0] - y];
    for (let l = L - 2; l >= 0; l--) {
      const aThis = acts[l + 1];
      const dNext = deltas[l + 1];
      const wNext = net.W[l + 1];
      const d = new Array(net.W[l].length).fill(0);
      for (let k = 0; k < d.length; k++) {
        let s = 0;
        for (let j = 0; j < wNext.length; j++) s += wNext[j][k] * dNext[j];
        d[k] = s * (1 - aThis[k] * aThis[k]);
      }
      deltas[l] = d;
    }
    for (let l = 0; l < L; l++) {
      const aPrev = acts[l];
      for (let j = 0; j < net.W[l].length; j++) {
        gB[l][j] += deltas[l][j];
        for (let k = 0; k < aPrev.length; k++) gW[l][j][k] += deltas[l][j] * aPrev[k];
      }
    }
  }
  const n = data.length;
  for (let l = 0; l < L; l++)
    for (let j = 0; j < net.W[l].length; j++) {
      net.b[l][j] -= (lr * gB[l][j]) / n;
      for (let k = 0; k < net.W[l][j].length; k++) net.W[l][j][k] -= (lr * gW[l][j][k]) / n;
    }
}

function evaluate(net: Net, data: Sample[]) {
  let loss = 0;
  let correct = 0;
  const L = net.W.length;
  for (const { x, y } of data) {
    const o = forward(net, x)[L][0];
    const p = Math.min(1 - 1e-7, Math.max(1e-7, o));
    loss += -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
    if ((o >= 0.5 ? 1 : 0) === y) correct++;
  }
  return { loss: loss / data.length, acc: correct / data.length };
}

// Round coords so 1-ULP Math.sqrt/log/cos diffs (SSR vs browser) don't trip a
// hydration mismatch on the SSR-rendered points.
const r2 = (n: number) => Math.round(n * 100) / 100;
const toX = (x1: number) => r2(((x1 + 1) / 2) * S);
const toY = (x2: number) => r2(S - ((x2 + 1) / 2) * S);

export function SpiralClassifier() {
  const [dataset, setDataset] = useState<Dataset>("spiral");
  const [hidden, setHidden] = useState(8);
  const [lr, setLr] = useState(0.3);
  const [training, setTraining] = useState(false);
  const [stats, setStats] = useState({ epoch: 0, acc: 0, loss: 1 });

  const dataRef = useRef<Sample[]>(makeData("spiral", 1));
  const netRef = useRef<Net>(makeNet(8, 7));
  const epochRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const c = useThemeColors({ teal: "--teal", rose: "--rose" });

  const rebuild = useCallback((ds: Dataset, H: number, seed = 7) => {
    dataRef.current = makeData(ds, ds.length + H);
    netRef.current = makeNet(H, seed);
    epochRef.current = 0;
    setStats({ epoch: 0, ...evaluate(netRef.current, dataRef.current) });
  }, []);

  const drawField = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv || !c.teal) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const teal = hexRgb(c.teal);
    const rose = hexRgb(c.rose);
    const img = ctx.createImageData(FN, FN);
    const net = netRef.current;
    const L = net.W.length;
    for (let j = 0; j < FN; j++) {
      for (let i = 0; i < FN; i++) {
        const x1 = (i / (FN - 1)) * 2 - 1;
        const x2 = (1 - j / (FN - 1)) * 2 - 1;
        const o = forward(net, [x1, x2])[L][0];
        const idx = (j * FN + i) * 4;
        img.data[idx] = rose[0] + (teal[0] - rose[0]) * o;
        img.data[idx + 1] = rose[1] + (teal[1] - rose[1]) * o;
        img.data[idx + 2] = rose[2] + (teal[2] - rose[2]) * o;
        img.data[idx + 3] = 125;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [c.teal, c.rose]);

  // initial + on-change rebuild
  useEffect(() => {
    rebuild(dataset, hidden);
    setTraining(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset, hidden]);

  // redraw field after a rebuild (dataset/hidden change) or theme change
  useEffect(() => {
    drawField();
  }, [drawField, dataset, hidden]);

  // training loop
  useEffect(() => {
    if (!training) return;
    let raf = 0;
    const tick = () => {
      const net = netRef.current;
      const data = dataRef.current;
      for (let s = 0; s < 4; s++) {
        trainEpoch(net, data, lr);
        epochRef.current++;
      }
      const ev = evaluate(net, data);
      setStats({ epoch: epochRef.current, acc: ev.acc, loss: ev.loss });
      drawField();
      if (epochRef.current > 4000) {
        setTraining(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [training, lr, drawField]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_15rem]">
      <div>
        <div className="relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden rounded-2xl border border-border bg-surface-2">
          <canvas ref={canvasRef} width={FN} height={FN} className="absolute inset-0 h-full w-full" />
          <svg viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 h-full w-full">
            {dataRef.current.map((p, i) => (
              <circle
                key={i}
                cx={toX(p.x[0])}
                cy={toY(p.x[1])}
                r={5}
                fill={p.y === 1 ? c.teal : c.rose}
                stroke="white"
                strokeWidth={1.5}
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-border bg-background/85 px-3 py-1 text-xs font-medium backdrop-blur">
            epoch <span className="font-mono tabular-nums">{stats.epoch}</span>
          </div>
        </div>
        <p className="mt-2.5 text-center text-xs text-muted">
          The coloured map is what the network believes · it bends and folds as the layers learn
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-muted">Dataset</p>
          <SegmentedControl
            value={dataset}
            onChange={setDataset}
            className="grid w-full grid-cols-2 gap-1 [&>button]:w-full"
            options={[
              { value: "spiral", label: "Spiral" },
              { value: "circle", label: "Circle" },
              { value: "xor", label: "XOR" },
              { value: "blobs", label: "Blobs" },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <StatPill label="Accuracy" value={`${Math.round(stats.acc * 100)}%`} accent={stats.acc > 0.95 ? c.teal : undefined} />
          <StatPill label="Loss" value={stats.loss.toFixed(3)} accent={c.rose} />
        </div>

        <Slider label="Neurons / layer" value={hidden} min={2} max={10} step={1} onChange={(v) => setHidden(Math.round(v))} />
        <Slider label="Learning rate" value={lr} min={0.02} max={1} step={0.02} onChange={setLr} format={(v) => v.toFixed(2)} />

        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => setTraining((t) => !t)}>
            {training ? <Pause size={15} /> : <Play size={15} />}
            {training ? "Pause" : "Train"}
          </Button>
          <Button variant="secondary" size="md" aria-label="Reset" onClick={() => rebuild(dataset, hidden, Math.floor(Math.random() * 1e6))}>
            <RotateCcw size={15} />
          </Button>
        </div>
        <p className="text-xs text-subtle">
          Two hidden layers of {hidden} neurons. Press Train and watch the boundary curl around the data.
        </p>
      </div>
    </div>
  );
}
