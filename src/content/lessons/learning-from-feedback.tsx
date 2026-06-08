import { Prose, Lead, P, H2, Strong, Em, Term } from "@/components/lesson/prose";
import { Callout } from "@/components/lesson/Callout";
import { ArtifactFrame } from "@/components/lesson/ArtifactFrame";
import { RlhfTrainer } from "@/components/artifacts/RlhfTrainer";

export function LearningFromFeedbackContent() {
  return (
    <Prose>
      <Lead>
        Fine-tuning taught the model to answer. But among a dozen perfectly fluent answers, which one is{" "}
        <Em>best</Em>? Nobody can write a demonstration for every situation — so we let humans be the judges.
      </Lead>

      <P>
        Even after fine-tuning, a model can be correct but waffly, or polite but evasive, or confidently unsafe. You
        can&apos;t hand-write the ideal reply to every possible prompt. So the trick flips around: instead of showing
        the model the right answer, you show it <Strong>two</Strong> answers and have a person pick the better one.
        Do that thousands of times and a pattern emerges. Be the judge:
      </P>

      <ArtifactFrame
        title="Thumbs-Up Trainer"
        hint="Pick the better answer · watch its voice drift"
        caption="Every preference you give nudges a little reward model. The assistant's own style follows whatever you reward most."
      >
        <RlhfTrainer />
      </ArtifactFrame>

      <Callout tone="try">
        <p>
          Rate a few rounds by hand and watch the bars move. Then try the shortcut{" "}
          <Strong>&ldquo;Always reward flattery&rdquo;</Strong> — keep upvoting the answer that <Em>sounds</Em>{" "}
          nicest — and watch the assistant curdle into a grovelling sycophant. Hit <Strong>&ldquo;Always reward
          honesty&rdquo;</Strong> to feel the opposite pull.
        </p>
      </Callout>

      <H2>Why it&apos;s polite — and why it sometimes grovels</H2>
      <P>
        Those preferences train a second model, a{" "}
        <Term define="Reward model: a model trained on human preference comparisons to predict how much a person would like a given response. It turns 'A is better than B' into a score.">
          reward model
        </Term>
        , that learns to score any answer the way the human raters would. Then the assistant is tuned to produce
        answers that score highly. That whole loop — generate, get rated, chase the reward — is{" "}
        <Term define="Reinforcement Learning from Human Feedback (RLHF): optimise a language model against a reward model trained on human preferences, so its outputs match what people prefer.">
          RLHF
        </Term>
        , and it&apos;s the polish that made ChatGPT feel helpful instead of merely fluent.
      </P>

      <Callout tone="key">
        <p>
          Fine-tuning shows the model <Em>what</Em> to say. RLHF teaches it <Em>which way people prefer it said</Em> —
          helpful, harmless, honest. It&apos;s the difference between a model that can answer and one that&apos;s
          actually pleasant to talk to.
        </p>
      </Callout>

      <P>
        But notice the trap you just sprang. The reward is only a <Strong>stand-in</Strong> for what we really want.
        A warm, agreeable, flattering answer is easy to upvote even when it&apos;s useless — so a model optimised hard
        enough learns to <Em>game</Em> the reward: maximally pleasant, minimally truthful. That failure has a name,{" "}
        <Term define="Reward hacking: when an optimiser maximises the measured reward in a way that violates the intent behind it — e.g. a model that flatters to win approval instead of being genuinely helpful.">
          reward hacking
        </Term>
        , and sycophancy is its most familiar face.
      </P>

      <Callout tone="recap">
        <p>
          Tokens → pretraining → fine-tuning → RLHF. That&apos;s the assembly line behind a modern assistant. One
          ingredient is still unexplained, though — the one that made the base model good enough to be worth tuning at
          all. That ingredient is sheer <Strong>scale</Strong>, and it&apos;s the last stop in this chapter.
        </p>
      </Callout>
    </Prose>
  );
}
