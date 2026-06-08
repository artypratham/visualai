import { Prose, Lead, P, H2, Strong, Em, Term } from "@/components/lesson/prose";
import { Callout } from "@/components/lesson/Callout";
import { ArtifactFrame } from "@/components/lesson/ArtifactFrame";
import { AttentionVisualizer } from "@/components/artifacts/AttentionVisualizer";

export function AttentionContent() {
  return (
    <Prose>
      <Lead>
        This is the idea that unlocked ChatGPT. It has an intimidating name — the transformer — but the core
        move is something you do instinctively when you read: every word glances at the others and decides which
        ones matter.
      </Lead>

      <P>
        We can turn words into vectors now, but a word&apos;s meaning still depends on its neighbours. Read this:{" "}
        <Em>&ldquo;The cat sat on the mat because it was tired.&rdquo;</Em> What does <Strong>it</Strong> refer
        to — the cat or the mat? You knew instantly, because you let &ldquo;it&rdquo; look back at the rest of the
        sentence. That glancing-around is <Strong>attention</Strong>, and it&apos;s a thing a model can compute.
      </P>

      <ArtifactFrame
        title="Attention Visualizer"
        hint="Click a word to make it the one that's 'looking'"
        caption="A real transformer computes these weights from the words. Here they're set to show the patterns a trained model actually learns."
      >
        <AttentionVisualizer />
      </ArtifactFrame>

      <Callout tone="try">
        <p>
          On the first sentence, click <Strong>it</Strong> — it lights up <Strong>cat</Strong>, not mat. Now the
          mind-bender: switch to the two <Em>trophy / suitcase</Em> sentences. They&apos;re identical except for
          one final word — <Strong>big</Strong> vs <Strong>small</Strong> — and watch &ldquo;it&rdquo; flip which
          object it attends to. The model resolves the meaning purely from context. Slide{" "}
          <Strong>sharpness</Strong> to see attention focus or blur.
        </p>
      </Callout>

      <H2>How a word &ldquo;looks&rdquo;</H2>
      <P>
        Each word produces two things from its vector: a{" "}
        <Term define="What a word is looking for in the others.">query</Term> (&ldquo;what am I trying to
        understand?&rdquo;) and a <Term define="What a word offers to others that are looking.">key</Term>{" "}
        (&ldquo;here&apos;s what I am&rdquo;). To decide how much word A should attend to word B, the model
        compares A&apos;s query with B&apos;s key — a strong match means high attention. Every word does this for
        every other word, and the matches are squashed into the percentages you see. Because each word attends to
        the others in the <Em>same</Em> sentence, it&apos;s called{" "}
        <Term define="Attention computed among the words of a single sequence, letting each draw context from the rest.">
          self-attention
        </Term>
        .
      </P>

      <Callout tone="key">
        <p>
          Attention lets every word reach out and pull in meaning from the other words that matter most to it,
          ignoring the rest. Stacking layers of this is the <Strong>transformer</Strong> — the architecture
          behind essentially every modern language model. The 2017 paper that introduced it was titled, fittingly,{" "}
          <Em>&ldquo;Attention Is All You Need.&rdquo;</Em>
        </p>
      </Callout>

      <P>
        Real models run many attention patterns in parallel — different &ldquo;heads&rdquo; that each learn a
        different kind of relationship (one tracks who-did-what, another matches adjectives to nouns, another
        follows pronouns like our &ldquo;it&rdquo;). And they stack dozens of these layers, so context builds up
        richer and richer as it flows through.
      </P>

      <Callout tone="recap">
        <p>
          Now you have every ingredient: words as vectors (Lesson 6), attention to mix in context (this lesson),
          and a deep neural network trained by gradient descent (Lessons 3–5). Wire them together, train the
          whole thing to do one absurdly simple task — <Strong>guess the next word</Strong> — over a good chunk of
          the internet, and you get a large language model. In the finale, you become the model.
        </p>
      </Callout>
    </Prose>
  );
}
