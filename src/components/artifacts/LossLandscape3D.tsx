"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { Slider, StatPill } from "@/components/ui/controls";
import { Button } from "@/components/ui/Button";
import { useThemeColors } from "@/lib/useThemeColors";

/**
 * An interactive 3D loss landscape — hand-rolled projection on <canvas>, no
 * 3D library. Drag to orbit. Drop a ball and watch gradient descent roll it
 * downhill; tune learning rate and momentum and feel why both matter.
 * The surface has a global minimum AND a shallower local minimum.
 */

const CW = 720;
const CH = 460;
const GRID = 26;
const RANGE = 2.4; // domain [-RANGE, RANGE]

// loss surface: bowl + deep valley (global min) + shallow dip (local min)
function f(x: number, y: number) {
  return (
    0.16 * (x * x + y * y) -
    1.15 * Math.exp(-(((x - 1.15) ** 2 + (y - 0.85) ** 2) / 0.62)) -
    0.55 * Math.exp(-(((x + 1.25) ** 2 + (y + 1.0) ** 2) / 0.45)) +
    1.2
  );
}
function grad(x: number, y: number): [number, number] {
  const h = 1e-4;
  return [(f(x + h, y) - f(x - h, y)) / (2 * h), (f(x, y + h) - f(x, y - h)) / (2 * h)];
}

const Z_MIN = 0.0;
const Z_MAX = 2.6;

export function LossLandscape3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [theta, setTheta] = useState(0.85); // orbit
  const [phi, setPhi] = useState(0.46); // tilt
  const [lr, setLr] = useState(0.08);
  const [beta, setBeta] = useState(0.55);
  const ballRef = useRef<{ x: number; y: number; vx: number; vy: number; trail: [number, number][] } | null>(null);
  const [rolling, setRolling] = useState(false);
  const [readout, setReadout] = useState({ loss: 0, steps: 0 });
  const dragRef = useRef<{ px: number; py: number } | null>(null);
  const c = useThemeColors({ teal: "--teal", rose: "--rose", accent: "--accent", fg: "--foreground", surface: "--surface" });

  // 3D -> 2D projection
  const project = useCallback(
    (x: number, y: number, z: number): [number, number, number] => {
      const ct = Math.cos(theta);
      const st = Math.sin(theta);
      const u = ct * x - st * y;
      const v = st * x + ct * y;
      const cp = Math.cos(phi);
      const sp = Math.sin(phi);
      const depth = v * cp - 0; // for sorting
      const sx = CW / 2 + u * 118;
      const sy = CH / 2 + 60 + v * sp * 118 - (z - 1.2) * cp * 150;
      return [sx, sy, depth];
    },
    [theta, phi],
  );

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv || !c.teal) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, CW, CH);

    // mesh: rows and columns, drawn far-to-near for painter's order
    const step = (2 * RANGE) / GRID;
    type Seg = { x1: number; y1: number; x2: number; y2: number; depth: number; t: number };
    const segs: Seg[] = [];
    for (let i = 0; i <= GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        const x1 = -RANGE + i * step;
        const y1 = -RANGE + j * step;
        const x2 = x1;
        const y2 = y1 + step;
        // row-direction segment
        const za = f(x1, y1);
        const zb = f(x2, y2);
        const [sx1, sy1, d1] = project(x1, y1, za);
        const [sx2, sy2, d2] = project(x2, y2, zb);
        segs.push({ x1: sx1, y1: sy1, x2: sx2, y2: sy2, depth: (d1 + d2) / 2, t: ((za + zb) / 2 - Z_MIN) / (Z_MAX - Z_MIN) });
      }
    }
    for (let j = 0; j <= GRID; j++) {
      for (let i = 0; i < GRID; i++) {
        const x1 = -RANGE + i * step;
        const y1 = -RANGE + j * step;
        const x2 = x1 + step;
        const za = f(x1, y1);
        const zb = f(x2, y1);
        const [sx1, sy1, d1] = project(x1, y1, za);
        const [sx2, sy2, d2] = project(x2, y1, zb);
        segs.push({ x1: sx1, y1: sy1, x2: sx2, y2: sy2, depth: (d1 + d2) / 2, t: ((za + zb) / 2 - Z_MIN) / (Z_MAX - Z_MIN) });
      }
    }
    segs.sort((a, b) => a.depth - b.depth);

    for (const s of segs) {
      const t = Math.max(0, Math.min(1, s.t));
      // low loss = teal, high loss = rose
      ctx.strokeStyle = `color-mix(in srgb, ${c.rose} ${Math.round(t * 100)}%, ${c.teal})`;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // ball + trail
    const ball = ballRef.current;
    if (ball) {
      if (ball.trail.length > 1) {
        ctx.strokeStyle = c.accent;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ball.trail.forEach(([tx, ty], i) => {
          const [sx, sy] = project(tx, ty, f(tx, ty) + 0.03);
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.stroke();
      }
      const [bx, by] = project(ball.x, ball.y, f(ball.x, ball.y) + 0.05);
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.arc(bx, by, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [project, c]);

  useEffect(() => {
    draw();
  }, [draw, readout]);

  // rolling physics: gradient descent with momentum
  useEffect(() => {
    if (!rolling) return;
    let raf = 0;
    let steps = 0;
    const tick = () => {
      const ball = ballRef.current;
      if (!ball) return;
      for (let k = 0; k < 2; k++) {
        const [gx, gy] = grad(ball.x, ball.y);
        ball.vx = beta * ball.vx - lr * gx;
        ball.vy = beta * ball.vy - lr * gy;
        ball.x = Math.max(-RANGE, Math.min(RANGE, ball.x + ball.vx));
        ball.y = Math.max(-RANGE, Math.min(RANGE, ball.y + ball.vy));
        steps++;
      }
      ball.trail.push([ball.x, ball.y]);
      if (ball.trail.length > 220) ball.trail.shift();
      const speed = Math.hypot(ball.vx, ball.vy);
      setReadout((r) => ({ loss: f(ball.x, ball.y), steps: r.steps + 2 }));
      if (speed < 0.0006 && steps > 30) {
        setRolling(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rolling, lr, beta]);

  const drop = () => {
    // start near the rim, biased so both minima are reachable
    const x = -2.0 + Math.random() * 0.8;
    const y = 1.4 + Math.random() * 0.7;
    ballRef.current = { x, y, vx: 0, vy: 0, trail: [[x, y]] };
    setReadout({ loss: f(x, y), steps: 0 });
    setRolling(true);
  };

  // drag to orbit
  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { px: e.clientX, py: e.clientY };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    setTheta((t) => t + (e.clientX - d.px) * 0.008);
    setPhi((p) => Math.max(0.15, Math.min(1.1, p + (e.clientY - d.py) * 0.005)));
    dragRef.current = { px: e.clientX, py: e.clientY };
  };
  const onPointerUp = () => (dragRef.current = null);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_15rem]">
      <div>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-2">
          <canvas
            ref={canvasRef}
            width={CW}
            height={CH}
            className="block w-full touch-none"
            style={{ cursor: "grab" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
        </div>
        <p className="mt-2.5 text-center text-xs text-muted">
          Drag to orbit the landscape · teal = low loss, rose = high · the deep valley is the global minimum; the small
          dip is a <span className="font-medium text-foreground">local</span> minimum trap
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Slider label="Learning rate η" value={lr} min={0.01} max={0.4} step={0.005} onChange={setLr} format={(v) => v.toFixed(3)} />
        <Slider label="Momentum β" value={beta} min={0} max={0.95} step={0.05} onChange={setBeta} format={(v) => v.toFixed(2)} />
        <div className="grid grid-cols-2 gap-2.5">
          <StatPill label="Loss" value={readout.loss.toFixed(3)} accent={c.rose} />
          <StatPill label="Steps" value={readout.steps} />
        </div>
        <Button onClick={drop}>
          <Play size={15} /> Drop a ball
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setTheta(0.85);
            setPhi(0.46);
            ballRef.current = null;
            setReadout({ loss: 0, steps: 0 });
            setRolling(false);
          }}
        >
          <RotateCcw size={14} /> Reset
        </Button>
        <p className="text-xs text-subtle">
          Low momentum + unlucky start → the ball parks in the shallow dip. Raise β and it carries enough speed to
          escape and find the deep valley. That&apos;s why optimisers have momentum.
        </p>
      </div>
    </div>
  );
}
