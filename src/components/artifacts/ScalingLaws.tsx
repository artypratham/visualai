"use client";

import { useMemo, useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { motion } from "motion/react";
import { Slider, SegmentedControl, StatPill } from "@/components/ui/controls";
import { useThemeColors } from "@/lib/useThemeColors";

// Scaling laws, made tangible. Three sliders — data, parameters, compute — set
// an "effective scale". Loss falls along a power law: a smooth curve here, a
// dead-straight line in log-log. The catch (Chinchilla, felt): the model is only
// as big as its *weakest* ingredient, so cranking one slider alone barely helps.
// And falling loss is made real by a sample-quality ladder + a sudden emergent skill.

const W = 600;
const H = 340;
const padL = 52;
const padR = 18;
const padT = 18;
const padB = 36;
const plotW = W - padL - padR;
const plotH = H - padT - padB;

const LINF = 1.6; // irreducible loss
const A = 2.4;
const B = 0.3;

const r2 = (n: number) => Math.round(n * 100) / 100;
const lossAt = (e: number) => LINF + A * Math.pow(10, -B * e);

const EMERGE_AT = 3.0; // effective scale where the skill "switches on"

type Axis = "data" | "params" | "compute";
const AXIS_LABEL: Record<Axis, string> = { data: "data-limited", params: "parameter-limited", compute: "compute-limited" };

interface Tier {
  min: number;
  label: string;
  text: string;
}
// Higher loss → worse text. Make a falling number mean something you can read.
const LADDER: Tier[] = [
  { min: 3.4, label: "gibberish", text: "th eqe oon a th the rrr aa the the oot n" },
  { min: 3.0, label: "real words, no grammar", text: "cat the and to house when the the run sky was" },
  { min: 2.6, label: "rough grammar", text: "The cat sat on the and looked at window the happy." },
  { min: 2.2, label: "coherent sentences", text: "The cat sat on the mat and looked out the window at the warm sun." },
  { min: 0, label: "fluent prose", text: "The cat stretched across the warm windowsill, watching the afternoon light spill slowly over the floorboards." },
];
const tierFor = (loss: number) => LADDER.find((t) => loss >= t.min) ?? LADDER[LADDER.length - 1];

const fmtMag = (e: number) => {
  const v = Math.round(Math.pow(10, e));
  return v.toLocaleString("en-US") + "×";
};

export function ScalingLaws() {
  const [data, setData] = useState(1);
  const [params, setParams] = useState(1);
  const [compute, setCompute] = useState(1);
  const [view, setView] = useState<"curve" | "loglog">("curve");

  const c = useThemeColors({ teal: "--teal", rose: "--rose", accent: "--accent", grid: "--border", sub: "--subtle" });

  // The weakest ingredient is the bottleneck — that's the whole lesson.
  const effExp = Math.min(data, params, compute);
  const bottleneck: Axis = data <= params && data <= compute ? "data" : params <= compute ? "params" : "compute";
  const spread = Math.max(data, params, compute) - effExp;
  const loss = lossAt(effExp);
  const tier = tierFor(loss);
  const emerged = effExp >= EMERGE_AT;

  // y mapping depends on view
  const yDomain = view === "curve" ? [1.5, 4.05] : [-0.95, 0.45];
  const toY = (val: number) => {
    const [lo, hi] = yDomain;
    return r2(padT + plotH - ((val - lo) / (hi - lo)) * plotH);
  };
  const toX = (e: number) => r2(padL + (e / 4) * plotW);
  const yVal = (e: number) => (view === "curve" ? lossAt(e) : Math.log10(lossAt(e) - LINF));

  const curve = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 120; i++) {
      const e = (i / 120) * 4;
      pts.push(`${toX(e)},${toY(yVal(e))}`);
    }
    return pts.join(" ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const yTicks = view === "curve" ? [2, 2.5, 3, 3.5, 4] : [-0.75, -0.25, 0.25];
  const xTicks = [0, 1, 2, 3, 4];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
      {/* stage */}
      <div className="flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            {/* y grid + labels */}
            {yTicks.map((t) => (
              <g key={`y${t}`}>
                <line x1={padL} y1={toY(t)} x2={padL + plotW} y2={toY(t)} stroke={c.grid} strokeWidth={1} opacity={0.5} />
                <text x={padL - 8} y={toY(t) + 4} textAnchor="end" fontSize={11} fill={c.sub}>
                  {view === "curve" ? t.toFixed(1) : t.toFixed(2)}
                </text>
              </g>
            ))}
            {/* x ticks */}
            {xTicks.map((t) => (
              <text key={`x${t}`} x={toX(t)} y={H - 12} textAnchor="middle" fontSize={11} fill={c.sub}>
                {fmtMag(t)}
              </text>
            ))}
            {/* axis titles */}
            <text x={padL + plotW / 2} y={H - 1} textAnchor="middle" fontSize={11} fill={c.sub}>
              effective scale (data × params × compute)
            </text>
            <text x={14} y={padT + plotH / 2} textAnchor="middle" fontSize={11} fill={c.sub} transform={`rotate(-90 14 ${padT + plotH / 2})`}>
              {view === "curve" ? "loss (lower = better)" : "log(loss − floor)"}
            </text>

            {/* irreducible floor (curve view only) */}
            {view === "curve" && (
              <line x1={padL} y1={toY(LINF)} x2={padL + plotW} y2={toY(LINF)} stroke={c.sub} strokeWidth={1.5} strokeDasharray="4 5" opacity={0.6} />
            )}

            {/* the law */}
            <polyline points={curve} fill="none" stroke={c.accent} strokeWidth={3} />

            {/* current point + drop line */}
            <line x1={toX(effExp)} y1={toY(yVal(effExp))} x2={toX(effExp)} y2={padT + plotH} stroke={c.teal} strokeWidth={1.5} strokeDasharray="3 4" opacity={0.7} />
            <motion.circle cx={toX(effExp)} cy={toY(yVal(effExp))} r={6} fill={c.teal} stroke="white" strokeWidth={2} />
          </svg>
          <div className="pointer-events-none absolute right-3 top-3 rounded-lg border border-border bg-surface/80 px-2.5 py-1 text-[0.7rem] text-muted backdrop-blur">
            {view === "curve" ? "diminishing returns — each 10× buys less" : "a straight line — that's the scaling “law”"}
          </div>
        </div>

        {/* sample-quality ladder */}
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-subtle">What that loss can write</p>
            <span className="font-mono text-[0.7rem]" style={{ color: c.accent }}>{tier.label}</span>
          </div>
          <p className="mt-2 min-h-[2.5rem] font-mono text-[0.85rem] leading-relaxed text-foreground/85">
            “{tier.text}”
          </p>
        </div>
      </div>

      {/* controls */}
      <div className="flex flex-col gap-4">
        <Slider label="Data" value={data} min={0} max={4} step={0.25} accent="teal" onChange={setData} format={fmtMag} />
        <Slider label="Parameters (model size)" value={params} min={0} max={4} step={0.25} accent="accent" onChange={setParams} format={fmtMag} />
        <Slider label="Compute" value={compute} min={0} max={4} step={0.25} accent="amber" onChange={setCompute} format={fmtMag} />

        <div className="grid grid-cols-2 gap-2.5">
          <StatPill label="Loss" value={loss.toFixed(2)} accent={c.teal} />
          <StatPill label="Bottleneck" value={spread < 0.3 ? "balanced" : AXIS_LABEL[bottleneck].replace("-limited", "")} accent={spread < 0.3 ? c.teal : c.rose} />
        </div>

        <SegmentedControl
          options={[
            { value: "curve", label: "Curve" },
            { value: "loglog", label: "Log–log" },
          ]}
          value={view}
          onChange={setView}
          className="self-start"
        />

        {/* emergence */}
        <div
          className="flex items-center gap-3 rounded-xl border p-3 transition-colors"
          style={{
            borderColor: emerged ? "color-mix(in srgb, var(--teal) 45%, var(--border))" : "var(--border)",
            background: emerged ? "var(--teal-soft)" : "var(--surface)",
          }}
        >
          <motion.span
            key={emerged ? "on" : "off"}
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            className="grid h-8 w-8 place-items-center rounded-full text-white"
            style={{ background: emerged ? "var(--teal)" : "var(--border-strong)" }}
          >
            {emerged ? <Unlock size={15} /> : <Lock size={15} />}
          </motion.span>
          <div>
            <p className="text-sm font-semibold text-foreground">Multi-step arithmetic</p>
            <p className="text-[0.7rem]" style={{ color: emerged ? "var(--teal)" : "var(--subtle)" }}>
              {emerged ? "emerged — switched on at scale" : "locked — grow all three past 1,000×"}
            </p>
          </div>
        </div>

        <p className="text-xs text-subtle">
          Raise just one slider and the loss barely moves — the smallest ingredient is the bottleneck. Real labs grow
          all three together.
        </p>
      </div>
    </div>
  );
}
