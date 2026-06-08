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
  | "next-token"
  // Track A — Trust & Limits
  | "overfit-playground"
  | "biased-machine"
  | "confidently-wrong"
  // Track B — Beyond Text
  | "kernel-explorer"
  | "diffusion-denoiser"
  // Track C — How ChatGPT Was Made
  | "tokenizer"
  | "fine-tuning"
  | "rlhf-trainer"
  | "scaling-laws"
  // Track D — Other Ways to Learn
  | "kmeans"
  | "gridworld"
  // Track E — Using AI Well
  | "context-window"
  | "rag"
  | "agent-loop"
  | "prompt-lab";

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
  {
    id: "trust-and-limits",
    index: 4,
    title: "Trust & Limits",
    blurb: "Why AI gets things wrong — overfitting, bias, and confident nonsense.",
    accent: "amber",
  },
  {
    id: "beyond-text",
    index: 5,
    title: "Beyond Text",
    blurb: "AI's other senses: how it sees images, and how it paints new ones.",
    accent: "violet",
  },
  {
    id: "how-chatgpt-was-made",
    index: 6,
    title: "How ChatGPT Was Made",
    blurb: "The training pipeline behind a modern assistant, step by step.",
    accent: "teal",
  },
  {
    id: "other-ways-to-learn",
    index: 7,
    title: "Other Ways to Learn",
    blurb: "Not everything is labelled examples — clustering and learning by reward.",
    accent: "rose",
  },
  {
    id: "using-ai-well",
    index: 8,
    title: "Using AI Well",
    blurb: "Practical literacy: context, retrieval, agents, and prompting.",
    accent: "amber",
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

  // ---- Chapter 4 — Trust & Limits ----
  {
    slug: "overfitting",
    order: 9,
    chapterId: "trust-and-limits",
    title: "Overfitting",
    hook: "A model that aces its practice questions can still flunk the real exam — that's overfitting: memorising instead of understanding.",
    minutes: 8,
    status: "ready",
    artifact: "overfit-playground",
    takeaway: "Crank a model's complexity and watch it ace the training data while failing everything new.",
  },
  {
    slug: "bias",
    order: 10,
    chapterId: "trust-and-limits",
    title: "Bias In, Bias Out",
    hook: "An AI is only as fair as the examples it's fed. Give it a lopsided history and it learns lopsided rules.",
    minutes: 7,
    status: "soon",
    artifact: "biased-machine",
    takeaway: "Train a model on skewed data, watch it discriminate, then fix the data and watch it change.",
  },
  {
    slug: "why-ai-makes-things-up",
    order: 11,
    chapterId: "trust-and-limits",
    title: "Why AI Makes Things Up",
    hook: "Language models are built to sound right, not to be right. That gap is exactly where hallucinations live.",
    minutes: 7,
    status: "soon",
    artifact: "confidently-wrong",
    takeaway: "Watch a model state a fluent, confident, completely invented 'fact'.",
  },

  // ---- Chapter 5 — Beyond Text ----
  {
    slug: "how-ai-sees",
    order: 12,
    chapterId: "beyond-text",
    title: "How AI Sees",
    hook: "Before AI can recognise a face it has to find edges. One tiny sliding window does that — the seed of all computer vision.",
    minutes: 8,
    status: "ready",
    artifact: "kernel-explorer",
    takeaway: "Slide a 3×3 filter across an image and watch edges, blurs and embossing appear.",
  },
  {
    slug: "making-images",
    order: 13,
    chapterId: "beyond-text",
    title: "Making Images",
    hook: "Tools like Midjourney start from pure static and sculpt it into a picture. Here's the trick — one denoising step at a time.",
    minutes: 8,
    status: "soon",
    artifact: "diffusion-denoiser",
    takeaway: "Drag a slider from noise to image and feel how diffusion models paint.",
  },

  // ---- Chapter 6 — How ChatGPT Was Made ----
  {
    slug: "tokens",
    order: 14,
    chapterId: "how-chatgpt-was-made",
    title: "Tokens",
    hook: "An LLM doesn't read letters, or even words — it reads 'tokens'. It's also why it can't reliably spell 'strawberry'.",
    minutes: 7,
    status: "ready",
    artifact: "tokenizer",
    takeaway: "Type anything and watch it shatter into the exact chunks a model actually sees.",
  },
  {
    slug: "fine-tuning",
    order: 15,
    chapterId: "how-chatgpt-was-made",
    title: "Fine-Tuning",
    hook: "A base model knows a little about everything. Fine-tuning is the short, focused course that gives it a job.",
    minutes: 8,
    status: "soon",
    artifact: "fine-tuning",
    takeaway: "Nudge a generic model toward a specific style with just a handful of examples.",
  },
  {
    slug: "learning-from-feedback",
    order: 16,
    chapterId: "how-chatgpt-was-made",
    title: "Learning from Feedback",
    hook: "Why is ChatGPT polite and helpful? Humans rated thousands of answers, and it learned to chase the thumbs-up.",
    minutes: 9,
    status: "soon",
    artifact: "rlhf-trainer",
    takeaway: "Rate a model's answers 👍/👎 and watch its behaviour drift toward what you reward.",
  },
  {
    slug: "scaling-laws",
    order: 17,
    chapterId: "how-chatgpt-was-made",
    title: "Scaling Laws",
    hook: "The surprising engine of the AI boom: just make it bigger. More data, more parameters, more compute — predictably better.",
    minutes: 7,
    status: "soon",
    artifact: "scaling-laws",
    takeaway: "Slide data, size and compute and watch the error fall along a smooth curve.",
  },

  // ---- Chapter 7 — Other Ways to Learn ----
  {
    slug: "learning-without-labels",
    order: 18,
    chapterId: "other-ways-to-learn",
    title: "Learning Without Labels",
    hook: "Nobody tells these dots which group they belong to. The algorithm finds the groups entirely on its own.",
    minutes: 8,
    status: "ready",
    artifact: "kmeans",
    takeaway: "Watch k-means discover clusters in unlabelled data, step by step.",
  },
  {
    slug: "trial-and-error",
    order: 19,
    chapterId: "other-ways-to-learn",
    title: "Trial & Error",
    hook: "No examples, no labels — just rewards. This is how AI learns to play games and steer robots: try, fail, repeat.",
    minutes: 10,
    status: "soon",
    artifact: "gridworld",
    takeaway: "Watch an agent learn to reach a goal purely from reward and punishment.",
  },

  // ---- Chapter 8 — Using AI Well ----
  {
    slug: "the-context-window",
    order: 20,
    chapterId: "using-ai-well",
    title: "The Context Window",
    hook: "An AI's memory has a hard edge. Fill it up and the oldest words quietly fall off the back.",
    minutes: 7,
    status: "soon",
    artifact: "context-window",
    takeaway: "Stuff a conversation full of tokens and watch the model start to forget the start.",
  },
  {
    slug: "giving-ai-a-library",
    order: 21,
    chapterId: "using-ai-well",
    title: "Giving AI a Library",
    hook: "How do you make a model answer about your private documents? You let it look them up first. That's RAG.",
    minutes: 8,
    status: "soon",
    artifact: "rag",
    takeaway: "Ask a question and watch the system fetch the right page before it answers.",
  },
  {
    slug: "ai-that-acts",
    order: 22,
    chapterId: "using-ai-well",
    title: "AI That Acts",
    hook: "Chatbots talk. Agents do. Give a model tools and a loop, and it can think, act, and check its own work.",
    minutes: 8,
    status: "soon",
    artifact: "agent-loop",
    takeaway: "Watch a model reason, call a tool, read the result, and try again.",
  },
  {
    slug: "the-art-of-the-prompt",
    order: 23,
    chapterId: "using-ai-well",
    title: "The Art of the Prompt",
    hook: "Same model, same question — wildly different answers depending on how you ask. The prompt is the steering wheel.",
    minutes: 7,
    status: "soon",
    artifact: "prompt-lab",
    takeaway: "Compare how small changes to a prompt reshape the model's reply.",
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
