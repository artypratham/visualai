/**
 * The spine of VisualAI: chapters -> lessons. Each lesson maps to an
 * interactive artifact and a prose body (registered in src/content/lessons).
 * Order is deliberate — every lesson only assumes the ones before it.
 */

export type ArtifactKey =
  | "teach-the-machine"
  | "pixel-inspector"
  | "fit-the-line"
  | "neuron-playground"
  | "spiral-classifier"
  | "embedding-space"
  | "attention"
  | "next-token";

export type Accent = "violet" | "teal" | "rose" | "amber";

export interface Chapter {
  id: string;
  index: number;
  title: string;
  blurb: string;
  accent: Accent;
}

export interface Lesson {
  slug: string;
  order: number;
  chapterId: string;
  title: string;
  hook: string;
  minutes: number;
  status: "ready" | "soon";
  artifact: ArtifactKey | null;
  /** One-line "what you'll be able to feel" promise, shown on cards. */
  takeaway: string;
}

export const chapters: Chapter[] = [
  {
    id: "foundations",
    index: 1,
    title: "Foundations",
    blurb: "What AI actually is — and why it learns instead of being told.",
    accent: "violet",
  },
  {
    id: "how-machines-learn",
    index: 2,
    title: "How Machines Learn",
    blurb: "From a single straight line to networks that bend around anything.",
    accent: "teal",
  },
  {
    id: "language-models",
    index: 3,
    title: "Language Models",
    blurb: "How words become math, and how that math became ChatGPT.",
    accent: "rose",
  },
];

export const lessons: Lesson[] = [
  {
    slug: "what-is-ai",
    order: 1,
    chapterId: "foundations",
    title: "What is AI?",
    hook: "You won't program the rules. You'll show examples — and watch a machine find the rule itself.",
    minutes: 6,
    status: "ready",
    artifact: "teach-the-machine",
    takeaway: "Teach a machine to separate two kinds of things just by giving examples.",
  },
  {
    slug: "everything-is-numbers",
    order: 2,
    chapterId: "foundations",
    title: "Everything is Numbers",
    hook: "An image, to a computer, is just a grid of numbers. Once you see that, AI stops being magic.",
    minutes: 7,
    status: "ready",
    artifact: "pixel-inspector",
    takeaway: "Draw a digit and watch it turn into the exact grid of numbers a model sees.",
  },
  {
    slug: "patterns-and-prediction",
    order: 3,
    chapterId: "how-machines-learn",
    title: "Patterns & Prediction",
    hook: "Learning is just nudging a guess to be a little less wrong, over and over.",
    minutes: 8,
    status: "ready",
    artifact: "fit-the-line",
    takeaway: "Drag data around and run gradient descent by hand to watch error shrink.",
  },
  {
    slug: "the-neuron",
    order: 4,
    chapterId: "how-machines-learn",
    title: "The Neuron",
    hook: "The building block of every neural network is shockingly simple: multiply, add, decide.",
    minutes: 8,
    status: "ready",
    artifact: "neuron-playground",
    takeaway: "Turn three knobs and steer a single neuron's decision boundary in real time.",
  },
  {
    slug: "neural-networks",
    order: 5,
    chapterId: "how-machines-learn",
    title: "Neural Networks",
    hook: "One neuron draws a line. Stack a few and you can wrap a boundary around anything.",
    minutes: 10,
    status: "ready",
    artifact: "spiral-classifier",
    takeaway: "Train a tiny network to untangle a spiral that no single line could split.",
  },
  {
    slug: "words-as-numbers",
    order: 6,
    chapterId: "language-models",
    title: "Words as Numbers",
    hook: "Meaning becomes geometry: king − man + woman lands you right next to queen.",
    minutes: 9,
    status: "ready",
    artifact: "embedding-space",
    takeaway: "Move through a map of words where directions carry actual meaning.",
  },
  {
    slug: "attention",
    order: 7,
    chapterId: "language-models",
    title: "Attention",
    hook: "The idea behind the transformer: every word gets to decide which other words matter.",
    minutes: 10,
    status: "ready",
    artifact: "attention",
    takeaway: "Watch a sentence light up as each word pays attention to the others.",
  },
  {
    slug: "large-language-models",
    order: 8,
    chapterId: "language-models",
    title: "Large Language Models",
    hook: "ChatGPT, demystified: it's a machine guessing the next word — really, really well.",
    minutes: 9,
    status: "ready",
    artifact: "next-token",
    takeaway: "Become the model: pick the next token from live probabilities, and feel temperature.",
  },
];

// ------------------------------------------------------------------
//  Helpers
// ------------------------------------------------------------------

export const totalLessons = lessons.length;

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}

export function getChapter(id: string): Chapter | undefined {
  return chapters.find((c) => c.id === id);
}

export function lessonsByChapter(chapterId: string): Lesson[] {
  return lessons.filter((l) => l.chapterId === chapterId).sort((a, b) => a.order - b.order);
}

export function getAdjacentLessons(slug: string): { prev: Lesson | null; next: Lesson | null } {
  const idx = lessons.findIndex((l) => l.slug === slug);
  return {
    prev: idx > 0 ? lessons[idx - 1] : null,
    next: idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null,
  };
}

export const firstReadyLesson = lessons.find((l) => l.status === "ready") ?? lessons[0];

/** Accent -> CSS variable name, for inline styling. */
export const accentVar: Record<Accent, string> = {
  violet: "var(--accent)",
  teal: "var(--teal)",
  rose: "var(--rose)",
  amber: "var(--amber)",
};

export const accentSoftVar: Record<Accent, string> = {
  violet: "var(--accent-soft)",
  teal: "var(--teal-soft)",
  rose: "var(--rose-soft)",
  amber: "color-mix(in srgb, var(--amber) 16%, transparent)",
};
