"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Shuffle } from "lucide-react";
import { Slider, SegmentedControl } from "@/components/ui/controls";
import { Button } from "@/components/ui/Button";
import { mulberry32 } from "@/lib/prng";

const N = 88;
const STEPS = 30;
type RGB = [number, number, number];

const TARGETS: Record<string, (u: number, v: number) => RGB> = {
  Heart: (u, v) => {
    const x = (u - 0.5) * 2.5;
    const y = (0.54 - v) * 2.5;
    const a = x * x + y * y - 1;
    return a * a * a - x * x * y * y * y < 0 ? [224, 48, 80] : [250, 224, 232];
  },
  Smiley: (u, v) => {
    const r = Math.hypot(u - 0.5, v - 0.5);
    if (r > 0.42) return [126, 184, 240];
    if (Math.hypot(u - 0.38, v - 0.42) < 0.05 || Math.hypot(u - 0.62, v - 0.42) < 0.05) return [40, 40, 60];
    if (r > 0.18 && r < 0.25 && v > 0.54) return [40, 40, 60];
    return [250, 205, 44];
  },
  Tree: (u, v) => {
    if (v > 0.88) return [96, 172, 86];
    if (u > 0.46 && u < 0.54 && v > 0.58 && v < 0.9) return [120, 80, 44];
    if (Math.hypot(u - 0.5, v - 0.4) < 0.27) return [58, 158, 74];
    return [150, 202, 245];
  },
  House: (u, v) => {
    if (v > 0.82) return [96, 172, 86];
    if (u > 0.46 && u < 0.54 && v > 0.6 && v < 0.8) return [110, 74, 44]; // door
    if (u > 0.3 && u < 0.7 && v > 0.5 && v < 0.8) return [232, 212, 182]; // wall
    if (v > 0.3 && v < 0.5 && Math.abs(u - 0.5) < ((v - 0.3) / 0.2) * 0.26) return [182, 72, 60]; // roof
    return [150, 202, 245];
  },
};

export function DiffusionDenoiser() {
  const [target, setTarget] = useState("Heart");
  const [t, setT] = useState(0.15);
  const [noiseSeed, setNoiseSeed] = useState(1);
  const [animating, setAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const noise = useMemo(() => {
    const rng = mulberry32(noiseSeed);
    const arr = new Uint8Array(N * N * 3);
    for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(rng() * 256);
    return arr;
  }, [noiseSeed]);

  const targetData = useMemo(() => {
    const fn = TARGETS[target];
    const arr = new Uint8Array(N * N * 3);
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        const [r, g, b] = fn(x / N, y / N);
        const idx = (y * N + x) * 3;
        arr[idx] = r;
        arr[idx + 1] = g;
        arr[idx + 2] = b;
      }
    return arr;
  }, [target]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const a = Math.pow(t, 1.5); // image weight; 0 = pure noise, 1 = clean
    const img = ctx.createImageData(N, N);
    for (let i = 0; i < N * N; i++) {
      for (let ch = 0; ch < 3; ch++) {
        img.data[i * 4 + ch] = targetData[i * 3 + ch] * a + noise[i * 3 + ch] * (1 - a);
      }
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [targetData, noise, t]);

  useEffect(() => {
    if (!animating) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 2400);
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setAnimating(false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animating]);

  const step = Math.round(t * STEPS);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_15rem]">
      <div>
        <div className="relative mx-auto aspect-square w-full max-w-[400px] overflow-hidden rounded-2xl border border-border bg-surface">
          <canvas ref={canvasRef} width={N} height={N} className="block h-full w-full" style={{ imageRendering: t > 0.85 ? "auto" : "pixelated" }} />
          <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-border bg-background/85 px-3 py-1 font-mono text-xs backdrop-blur">
            denoising step {step}/{STEPS}
          </div>
        </div>
        <p className="mt-2.5 text-center text-xs text-muted">
          Every pixel starts as pure random static. Each step nudges it a little closer to the picture.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-muted">What to imagine</p>
          <SegmentedControl
            value={target}
            onChange={setTarget}
            className="grid w-full grid-cols-2 gap-1 [&>button]:w-full"
            options={Object.keys(TARGETS).map((k) => ({ value: k, label: k }))}
          />
        </div>

        <Slider label="Noise  →  image" value={t} min={0} max={1} step={0.01} onChange={(v) => { setAnimating(false); setT(v); }} format={(v) => `${Math.round(v * 100)}%`} />

        <Button onClick={() => { setT(0); setAnimating(true); }} disabled={animating}>
          <Play size={15} /> Animate denoising
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setNoiseSeed((s) => s + 1)}>
          <Shuffle size={14} /> New noise
        </Button>
        <p className="text-xs text-subtle">
          Drag the slider back to pure noise and animate again — a different starting static gives the same picture. That&apos;s generation, not memorisation.
        </p>
      </div>
    </div>
  );
}
