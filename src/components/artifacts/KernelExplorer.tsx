"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SegmentedControl } from "@/components/ui/controls";

const N = 96;

interface Preset {
  name: string;
  k: number[];
  div: number;
  off: number;
}

const PRESETS: Preset[] = [
  { name: "Identity", k: [0, 0, 0, 0, 1, 0, 0, 0, 0], div: 1, off: 0 },
  { name: "Edge detect", k: [-1, -1, -1, -1, 8, -1, -1, -1, -1], div: 1, off: 0 },
  { name: "Sharpen", k: [0, -1, 0, -1, 5, -1, 0, -1, 0], div: 1, off: 0 },
  { name: "Blur", k: [1, 1, 1, 1, 1, 1, 1, 1, 1], div: 9, off: 0 },
  { name: "Emboss", k: [-2, -1, 0, -1, 1, 1, 0, 1, 2], div: 1, off: 128 },
  { name: "Sobel", k: [-1, 0, 1, -2, 0, 2, -1, 0, 1], div: 1, off: 128 },
];

function makeImage(): Float32Array {
  const img = new Float32Array(N * N);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let v = 78 + (x / N) * 48; // gradient background
      if (Math.hypot(x - N * 0.34, y - N * 0.44) < N * 0.17) v = 212; // bright disk
      if (x > N * 0.58 && x < N * 0.86 && y > N * 0.27 && y < N * 0.73) v = 44; // dark block
      if (Math.abs(x - y - N * 0.04) < 1.3) v = 246; // bright diagonal
      for (const [dx, dy] of [[0.74, 0.16], [0.82, 0.21], [0.69, 0.23]] as const)
        if (Math.hypot(x - N * dx, y - N * dy) < 2.2) v = 235; // dots
      img[y * N + x] = Math.max(0, Math.min(255, v));
    }
  }
  return img;
}

function draw(canvas: HTMLCanvasElement | null, data: Float32Array | Uint8ClampedArray) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const img = ctx.createImageData(N, N);
  for (let i = 0; i < N * N; i++) {
    const v = Math.max(0, Math.min(255, data[i]));
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

function convolve(src: Float32Array, k: number[], div: number, off: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(N * N);
  const d = div || 1;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let s = 0;
      let idx = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const yy = Math.min(N - 1, Math.max(0, y + dy));
          const xx = Math.min(N - 1, Math.max(0, x + dx));
          s += src[yy * N + xx] * k[idx++];
        }
      out[y * N + x] = s / d + off;
    }
  }
  return out;
}

export function KernelExplorer() {
  const src = useMemo(makeImage, []);
  const [preset, setPreset] = useState("Edge detect");
  const [k, setK] = useState<number[]>(PRESETS[1].k);
  const [div, setDiv] = useState(1);
  const [off, setOff] = useState(0);

  const srcRef = useRef<HTMLCanvasElement | null>(null);
  const outRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => draw(srcRef.current, src), [src]);
  useEffect(() => draw(outRef.current, convolve(src, k, div, off)), [src, k, div, off]);

  const applyPreset = (name: string) => {
    const p = PRESETS.find((x) => x.name === name)!;
    setPreset(name);
    setK([...p.k]);
    setDiv(p.div);
    setOff(p.off);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_15rem]">
      <div className="grid grid-cols-2 gap-3">
        <figure className="m-0">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <canvas ref={srcRef} width={N} height={N} className="block aspect-square w-full" style={{ imageRendering: "pixelated" }} />
          </div>
          <figcaption className="mt-2 text-center text-xs font-medium text-muted">Original</figcaption>
        </figure>
        <figure className="m-0">
          <div className="overflow-hidden rounded-2xl border border-accent/40 bg-surface shadow-[var(--shadow-sm)]">
            <canvas ref={outRef} width={N} height={N} className="block aspect-square w-full" style={{ imageRendering: "pixelated" }} />
          </div>
          <figcaption className="mt-2 text-center text-xs font-medium text-accent">After the filter</figcaption>
        </figure>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-muted">Filter preset</p>
          <SegmentedControl
            value={preset}
            onChange={applyPreset}
            className="grid w-full grid-cols-2 gap-1 [&>button]:w-full"
            options={PRESETS.map((p) => ({ value: p.name, label: p.name }))}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-muted">The kernel (edit me)</p>
          <div className="grid grid-cols-3 gap-1.5">
            {k.map((v, i) => (
              <input
                key={i}
                type="number"
                value={v}
                onChange={(e) => {
                  const next = [...k];
                  next[i] = parseFloat(e.target.value) || 0;
                  setK(next);
                  setPreset("custom");
                }}
                className="h-11 w-full rounded-lg border border-border bg-surface-2 text-center font-mono text-sm text-foreground outline-none focus-visible:border-accent"
              />
            ))}
          </div>
          {div !== 1 && <p className="mt-1.5 text-xs text-subtle">÷ {div} (averaging)</p>}
        </div>

        <p className="text-xs text-subtle">
          Each output pixel = the 9 neighbours, each multiplied by its kernel number, summed up. That one tiny
          operation, repeated, is the foundation of how AI sees.
        </p>
      </div>
    </div>
  );
}
