"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Footprints } from "lucide-react";
import { StatPill } from "@/components/ui/controls";
import { Button } from "@/components/ui/Button";
import { useThemeColors } from "@/lib/useThemeColors";

const N = 6;
const S = 360;
const CS = S / N;
const START: [number, number] = [0, 5];
const GOAL: [number, number] = [5, 0];
const PITS: [number, number][] = [
  [3, 1],
  [3, 2],
  [3, 3],
  [1, 4],
];
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];
const ALPHA = 0.5;
const GAMMA = 0.92;

const eq = (a: [number, number], b: number, c: number) => a[0] === b && a[1] === c;
const isGoal = (x: number, y: number) => eq(GOAL, x, y);
const isPit = (x: number, y: number) => PITS.some((p) => p[0] === x && p[1] === y);
const isTerminal = (x: number, y: number) => isGoal(x, y) || isPit(x, y);
const reward = (x: number, y: number) => (isGoal(x, y) ? 1 : isPit(x, y) ? -1 : -0.02);
const sIdx = (x: number, y: number) => y * N + x;
const maxQ = (Q: Float32Array, s: number) => Math.max(Q[s * 4], Q[s * 4 + 1], Q[s * 4 + 2], Q[s * 4 + 3]);
const argmaxQ = (Q: Float32Array, s: number) => {
  let best = 0;
  for (let a = 1; a < 4; a++) if (Q[s * 4 + a] > Q[s * 4 + best]) best = a;
  return best;
};

function runEpisode(Q: Float32Array, eps: number): "goal" | "pit" | "timeout" {
  let [x, y] = START;
  for (let steps = 0; steps < 60; steps++) {
    const s = sIdx(x, y);
    const a = Math.random() < eps ? Math.floor(Math.random() * 4) : argmaxQ(Q, s);
    let nx = x + DX[a];
    let ny = y + DY[a];
    if (nx < 0 || nx >= N || ny < 0 || ny >= N) {
      nx = x;
      ny = y;
    }
    const term = isTerminal(nx, ny);
    const target = reward(nx, ny) + (term ? 0 : GAMMA * maxQ(Q, sIdx(nx, ny)));
    Q[s * 4 + a] += ALPHA * (target - Q[s * 4 + a]);
    x = nx;
    y = ny;
    if (term) return isGoal(x, y) ? "goal" : "pit";
  }
  return "timeout";
}

export function Gridworld() {
  const qRef = useRef<Float32Array>(new Float32Array(N * N * 4));
  const epRef = useRef(0);
  const outcomesRef = useRef<string[]>([]);
  const [, force] = useState(0);
  const [training, setTraining] = useState(false);
  const [stats, setStats] = useState({ episodes: 0, success: 0 });
  const [agent, setAgent] = useState<[number, number] | null>(null);

  const cc = useThemeColors({ teal: "--teal", rose: "--rose", accent: "--accent" });

  const redraw = () => force((n) => n + 1);

  const batch = useCallback(() => {
    const Q = qRef.current;
    const eps = Math.max(0.05, 0.35 - epRef.current * 0.0025);
    for (let i = 0; i < 4; i++) {
      const out = runEpisode(Q, eps);
      epRef.current++;
      outcomesRef.current.push(out);
      if (outcomesRef.current.length > 25) outcomesRef.current.shift();
    }
    const recent = outcomesRef.current;
    setStats({ episodes: epRef.current, success: recent.filter((o) => o === "goal").length / recent.length });
    redraw();
  }, []);

  useEffect(() => {
    if (!training) return;
    const id = setInterval(batch, 80);
    return () => clearInterval(id);
  }, [training, batch]);

  const reset = () => {
    qRef.current = new Float32Array(N * N * 4);
    epRef.current = 0;
    outcomesRef.current = [];
    setTraining(false);
    setAgent(null);
    setStats({ episodes: 0, success: 0 });
    redraw();
  };

  const play = () => {
    setTraining(false);
    const Q = qRef.current;
    let [x, y] = START;
    setAgent([x, y]);
    let steps = 0;
    const id = setInterval(() => {
      const a = argmaxQ(Q, sIdx(x, y));
      let nx = x + DX[a];
      let ny = y + DY[a];
      if (nx < 0 || nx >= N || ny < 0 || ny >= N) {
        nx = x;
        ny = y;
      }
      x = nx;
      y = ny;
      setAgent([x, y]);
      steps++;
      if (isTerminal(x, y) || steps > 30) {
        clearInterval(id);
        setTimeout(() => setAgent(null), 900);
      }
    }, 240);
  };

  const Q = qRef.current;
  const trained = epRef.current > 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_15rem]">
      <div>
        <div className="relative mx-auto aspect-square w-full max-w-[360px] overflow-hidden rounded-2xl border border-border bg-surface">
          <svg viewBox={`0 0 ${S} ${S}`} className="h-full w-full">
            <defs>
              <marker id="rl-arr" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="var(--muted)" />
              </marker>
            </defs>
            {Array.from({ length: N * N }, (_, s) => {
              const x = s % N;
              const y = Math.floor(s / N);
              const goal = isGoal(x, y);
              const pit = isPit(x, y);
              const v = maxQ(Q, s);
              let fill = "var(--surface)";
              if (goal) fill = "color-mix(in srgb, var(--teal) 55%, var(--surface))";
              else if (pit) fill = "color-mix(in srgb, var(--rose) 55%, var(--surface))";
              else if (Math.abs(v) > 0.001) {
                const col = v >= 0 ? "var(--teal)" : "var(--rose)";
                fill = `color-mix(in srgb, ${col} ${Math.min(60, Math.abs(v) * 60)}%, var(--surface))`;
              }
              const showArrow = !goal && !pit && trained && Math.abs(v) > 0.001;
              const a = showArrow ? argmaxQ(Q, s) : 0;
              const cx = x * CS + CS / 2;
              const cy = y * CS + CS / 2;
              return (
                <g key={s}>
                  <rect x={x * CS} y={y * CS} width={CS} height={CS} fill={fill} stroke="var(--border)" strokeWidth={1} />
                  {goal && <text x={cx} y={cy + 7} fontSize={22} textAnchor="middle">🏁</text>}
                  {pit && <text x={cx} y={cy + 6} fontSize={18} textAnchor="middle">⚠️</text>}
                  {showArrow && (
                    <line
                      x1={cx - DX[a] * 9}
                      y1={cy - DY[a] * 9}
                      x2={cx + DX[a] * 9}
                      y2={cy + DY[a] * 9}
                      stroke="var(--muted)"
                      strokeWidth={2}
                      markerEnd="url(#rl-arr)"
                    />
                  )}
                </g>
              );
            })}
            {/* start marker */}
            <circle cx={START[0] * CS + CS / 2} cy={START[1] * CS + CS / 2} r={5} fill="none" stroke="var(--subtle)" strokeWidth={2} />
            {/* agent */}
            {agent && (
              <circle cx={agent[0] * CS + CS / 2} cy={agent[1] * CS + CS / 2} r={11} fill={cc.accent} stroke="white" strokeWidth={2.5} style={{ transition: "cx 0.2s linear, cy 0.2s linear" }} />
            )}
          </svg>
        </div>
        <p className="mt-2.5 text-center text-xs text-muted">
          The agent only knows: 🏁 feels good (+1), ⚠️ feels bad (−1), every step costs a little. Colours = how good each square feels; arrows = the plan it&apos;s formed.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2.5">
          <StatPill label="Episodes" value={stats.episodes} />
          <StatPill label="Reaches goal" value={`${Math.round(stats.success * 100)}%`} accent={stats.success > 0.7 ? cc.teal : undefined} />
        </div>

        <Button onClick={() => setTraining((t) => !t)}>
          {training ? <Pause size={15} /> : <Play size={15} />}
          {training ? "Pause training" : trained ? "Keep training" : "Train the agent"}
        </Button>
        <Button variant="secondary" size="sm" onClick={play} disabled={!trained || training}>
          <Footprints size={15} /> Watch it play
        </Button>
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw size={14} /> Forget everything
        </Button>
        <p className="text-xs text-subtle">
          No examples of the right path are ever given. The agent stumbles into the goal by accident, remembers the
          reward, and slowly turns luck into a plan. That&apos;s reinforcement learning.
        </p>
      </div>
    </div>
  );
}
