# VisualAI

An interactive, visual learning roadmap for AI. Each concept ships with a hand-built interactive artifact that lets a complete beginner build intuition by tinkering — not just reading.

> **Live philosophy:** tinker first, name the jargon after, and never skip a rung. Built for someone with zero AI background.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** — static, frontend-only, no backend, no auth.
- **Tailwind CSS v4** with a custom design-token layer (warm-paper light theme + premium dark mode).
- **Framer Motion** (`motion`) for page motion, scroll-reveal, and spring interactions.
- Hand-rolled **SVG + Canvas** artifacts (no heavyweight viz framework) for full control.
- Progress saved to **localStorage** — no accounts, no tracking.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static production build (all pages prerendered)
```

## How it's organised

```
src/
  app/                     # routes: / , /learn , /learn/[slug] , /about
  components/
    site/                  # header, footer, logo, theme toggle
    ui/                    # Button, Reveal, controls (Slider, Segmented, StatPill)
    lesson/                # prose primitives, Callout, ArtifactFrame, LessonHero/Footer
    roadmap/               # the learning-path UI + progress summary
    artifacts/             # the interactive concept toys (one per lesson)
  content/lessons/         # the prose body for each lesson (weaves around its artifact)
  lib/
    curriculum.ts          # the spine: chapters -> lessons -> artifact keys
    progress.ts            # localStorage completion store (useSyncExternalStore)
    useThemeColors.ts      # resolve CSS vars for canvas, react to dark-mode toggle
```

Adding a concept = one entry in `curriculum.ts` + one artifact component + one prose body.

## Curriculum

**Chapter 1 — Foundations**
1. What is AI? — *Teach the Machine* (k-NN you train by clicking examples) ✅
2. Everything is Numbers — *Pixel Inspector* (draw a digit, see the number grid) ✅

**Chapter 2 — How Machines Learn**
3. Patterns & Prediction — *Fit the Line* (drag data, run gradient descent) ✅
4. The Neuron — *Neuron Playground* (3 knobs steer a decision boundary) ✅
5. Neural Networks — *Spiral Classifier* (a real net trains live via backprop) ✅

**Chapter 3 — Language Models**
6. Words as Numbers — *Embedding Space* (king − man + woman ≈ queen) ✅
7. Attention — *Attention Visualizer* (watch "it" attend to "cat") ✅
8. Large Language Models — *Next-Token Predictor* (be the model; temperature dial) ✅

All eight lessons are fully interactive.

## Project notes

Planning, decisions, research, and design notes live in the author's Obsidian vault — see `CLAUDE.md` for the path.
