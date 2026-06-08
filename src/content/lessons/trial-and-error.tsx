import { Prose, Lead, P, H2, Strong, Em, Term } from "@/components/lesson/prose";
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
    </Prose>
  );
}
