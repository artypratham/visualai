import { Prose, Lead, P, H2, Strong, Em, Term, Code } from "@/components/lesson/prose";
import { AdvancedSection, AdvH } from "@/components/lesson/AdvancedSection";
import { MathBlock, MathInline } from "@/components/lesson/math";
import { CodeBlock } from "@/components/lesson/CodeBlock";
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

      <AdvancedSection>
        <P>
          RLHF stitches together three things you&apos;ve already met — preference counting, gradient descent, and
          the reinforcement learning of the next chapter. Here are the actual objectives.
        </P>

        <AdvH>The math — turning thumbs into a score</AdvH>
        <P>
          A comparison &ldquo;answer <MathInline tex={String.raw`y_w`} /> beats answer{" "}
          <MathInline tex={String.raw`y_l`} />&rdquo; is modelled with the{" "}
          <Term define="A classic statistical model for paired comparisons — also used to rank chess players.">Bradley–Terry</Term>{" "}
          model: the probability a human prefers <MathInline tex={String.raw`y_w`} /> is the sigmoid of the score
          gap,
        </P>
        <MathBlock tex={String.raw`P(y_w \succ y_l) = \sigma\bigl(r_{\phi}(x, y_w) - r_{\phi}(x, y_l)\bigr)`} />
        <P>
          so training the reward model <MathInline tex={String.raw`r_{\phi}`} /> is just maximising the likelihood of
          the human votes:
        </P>
        <MathBlock tex={String.raw`\mathcal{L}_{\mathrm{RM}} = -\,\mathbb{E}\Bigl[\log \sigma\bigl(r_{\phi}(x, y_w) - r_{\phi}(x, y_l)\bigr)\Bigr]`} />
        <P>
          That&apos;s literally what the trait bars in the artifact were doing — each thumbs-up nudged a tiny
          reward model uphill on your vote (the same sigmoid from The Neuron, the same nudge from Lesson 3).
        </P>

        <AdvH>The math — chasing the reward without going feral</AdvH>
        <P>
          The assistant <MathInline tex={String.raw`\pi_{\theta}`} /> is then optimised to score highly — but with a
          leash. A KL-divergence penalty keeps it close to the well-behaved SFT model{" "}
          <MathInline tex={String.raw`\pi_{\mathrm{ref}}`} />:
        </P>
        <MathBlock tex={String.raw`\max_{\theta}\;\; \mathbb{E}_{y \sim \pi_{\theta}}\Bigl[\, r_{\phi}(x, y) \,\Bigr] \;-\; \beta\, \mathrm{KL}\bigl(\pi_{\theta} \,\Vert\, \pi_{\mathrm{ref}}\bigr)`} />
        <P>
          The <MathInline tex={String.raw`\beta`} /> term is the anti-reward-hacking brake: without it, the model
          drifts into whatever gibberish maxes the reward model — the sycophant you created, taken to its logical
          conclusion. (Classically this is optimised with PPO; a newer method, DPO, collapses the whole pipeline
          into one clever loss on the preference pairs directly — no separate reward model needed.)
        </P>

        <AdvH>The code</AdvH>
        <CodeBlock
          title="the RLHF loop"
          code={`# stage 1: reward model from human votes
for (prompt, better, worse) in comparisons:
    gap = RM(prompt, better) - RM(prompt, worse)
    descend(RM, -log(sigmoid(gap)))

# stage 2: tune the assistant against it (with the KL leash)
for prompt in prompts:
    answer = policy.generate(prompt)
    score  = RM(prompt, answer)
    score -= beta * KL(policy, reference, prompt, answer)
    ascend(policy, score)            # RL step (e.g. PPO)`}
        />
        <P>
          The deepest caveat is Goodhart&apos;s law: the reward model is a <Em>proxy</Em> trained on a few hundred
          thousand votes, and any proxy optimised hard enough stops measuring what you meant. Every lab&apos;s
          alignment team is, in one way or another, working on that single sentence.
        </P>
      </AdvancedSection>
    </Prose>
  );
}
