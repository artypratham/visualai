import { Prose, Lead, P, H2, Strong, Em, Term, Code } from "@/components/lesson/prose";
import { AdvancedSection, AdvH } from "@/components/lesson/AdvancedSection";
import { MathBlock, MathInline } from "@/components/lesson/math";
import { CodeBlock } from "@/components/lesson/CodeBlock";
import { Callout } from "@/components/lesson/Callout";
import { ArtifactFrame } from "@/components/lesson/ArtifactFrame";
import { Gridworld } from "@/components/artifacts/Gridworld";

export function TrialAndErrorContent() {
  return (
    <Prose>
      <Lead>
        Supervised learning needs labelled answers. Unsupervised learning needs none. There&apos;s a third way that
        needs neither — just the occasional reward — and it&apos;s how AI learned to beat world champions at Go.
      </Lead>

      <P>
        Think of training a dog. You don&apos;t show it a thousand labelled photos of &ldquo;sitting&rdquo; — you
        wait for it to sit, then give a treat. Over time it connects the action to the reward. This is{" "}
        <Term define="An agent learns which actions are good by trying them and observing rewards — no labelled examples.">
          reinforcement learning
        </Term>
        : an <Strong>agent</Strong> acts in a world, receives rewards, and gradually works out which behaviours pay
        off. The agent below knows nothing — not even where the goal is.
      </P>

      <ArtifactFrame
        title="Gridworld Agent"
        hint="Press Train and watch a plan appear from chaos"
        caption="It's never shown the right path. It only feels 🏁 = good, ⚠️ = bad, and stumbles its way to a strategy."
      >
        <Gridworld />
      </ArtifactFrame>

      <Callout tone="try">
        <p>
          Hit <Strong>Train</Strong>. At first the agent flails — wandering, dying in the hazards, rarely reaching
          the flag. But watch the squares slowly tint <Em>teal</Em> near the goal and <Em>red</Em> near the pits,
          and arrows snap into a route. When the success rate climbs, press <Strong>Watch it play</Strong> to see
          the plan it built. Then <Strong>Forget everything</Strong> and do it again.
        </p>
      </Callout>

      <H2>Turning luck into a plan</H2>
      <P>
        The colours are the agent&apos;s sense of <Term define="How much total future reward the agent expects from a square.">value</Term>{" "}
        — how good each square feels — and the arrows are its{" "}
        <Term define="The agent's chosen action in each state — its strategy.">policy</Term>. The trick (called
        Q-learning) is that the value of a square is the reward there <Em>plus</Em> the value of where it leads, so
        the &ldquo;this is good&rdquo; signal ripples backward from the goal, one square at a time. And it must{" "}
        <Strong>explore</Strong> — take random moves — to ever discover the goal in the first place, then{" "}
        <Strong>exploit</Strong> what it learned.
      </P>

      <Callout tone="key">
        <p>
          With nothing but a reward signal, an agent can invent sophisticated behaviour from scratch — no
          demonstrations required. This is how AIs mastered Go, Atari, and StarCraft. It&apos;s also the{" "}
          <Strong>RL</Strong> hiding inside &ldquo;RLHF,&rdquo; the technique that turned a rambling text predictor
          into the helpful assistant you actually talk to.
        </p>
      </Callout>

      <P>
        A warning that keeps researchers up at night: agents optimise the reward you <Em>wrote</Em>, not the one
        you <Em>meant</Em>. Give a boat-racing game points for hitting targets and it&apos;ll spin in circles
        farming targets forever instead of finishing the race. Designing rewards that can&apos;t be gamed is a deep,
        unsolved art.
      </P>

      <Callout tone="recap">
        <p>
          That completes the three ways machines learn — from labels, from structure, and from reward. You now have
          the whole toolkit. The final chapter is the most practical of all: not how these models work, but how to{" "}
          <Strong>wield</Strong> them well — starting with the hard edge of their memory.
        </p>
      </Callout>

      <AdvancedSection>
        <P>
          The colours and arrows you watched form are a table of numbers called <Code>Q</Code>, and the rule that
          fills it in is three lines of math.
        </P>

        <AdvH>The math</AdvH>
        <P>
          <MathInline tex={String.raw`Q(s, a)`} /> means: &ldquo;the total future reward I expect if I take action{" "}
          <MathInline tex={String.raw`a`} /> in square <MathInline tex={String.raw`s`} /> and act well afterwards.&rdquo;
          The key insight is that good values are <Em>self-consistent</Em> — a square is worth the reward you get
          plus the value of the best square it leads to. That recursion is the{" "}
          <Term define="The self-consistency equation that optimal values must satisfy.">Bellman equation</Term>:
        </P>
        <MathBlock tex={String.raw`Q^{*}(s, a) = \mathbb{E}\!\left[\, r + \gamma \max_{a'} Q^{*}(s', a') \,\right]`} />
        <P>
          where <MathInline tex={String.raw`\gamma \in [0,1)`} /> is the <Strong>discount</Strong> — how much
          tomorrow&apos;s reward counts versus today&apos;s (the artifact uses 0.92, which is what makes value fade
          smoothly with distance from the flag). Q-learning turns the equation into an update: after every single
          move, drag your estimate a little toward what the world just told you —
        </P>
        <MathBlock tex={String.raw`Q(s,a) \leftarrow Q(s,a) + \alpha \Bigl[\underbrace{r + \gamma \max_{a'} Q(s', a')}_{\text{what just happened}} - \underbrace{Q(s,a)}_{\text{what I believed}}\Bigr]`} />
        <P>
          The bracketed quantity is the <Em>temporal-difference error</Em> — surprise, in number form. Note the deep
          rhyme with Lesson 3: belief minus evidence, times a learning rate. It&apos;s gradient descent&apos;s
          worldview applied to decisions.
        </P>

        <AdvH>The code</AdvH>
        <P>This is the artifact&apos;s actual inner loop — it ran a few hundred times while you watched:</P>
        <CodeBlock
          title="one Q-learning episode (the Gridworld's real code)"
          code={`def run_episode(Q, eps):
    s = START
    while not terminal(s):
        if random() < eps:               # explore: try something random
            a = random_action()
        else:                            # exploit: use current best guess
            a = argmax(Q[s])
        s2, r = step(s, a)               # act, observe
        target = r + GAMMA * max(Q[s2])  # Bellman target
        Q[s][a] += ALPHA * (target - Q[s][a])
        s = s2`}
        />
        <P>
          The <Code>eps</Code> schedule (start ~0.35, decay to 0.05) is the{" "}
          <Strong>exploration–exploitation trade-off</Strong> made concrete: explore early or you never find the
          goal; exploit late or you never cash in. Scale this idea up — replace the Q-table with a neural network
          that <Em>estimates</Em> Q — and you have Deep Q-Networks, the system that learned Atari from pixels. Add
          human preference scores as the reward and you have the RLHF from the previous chapter.
        </P>
      </AdvancedSection>
    </Prose>
  );
}
