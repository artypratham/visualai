import { Prose, Lead, P, H2, Strong, Em, Term, Code } from "@/components/lesson/prose";
import { AdvancedSection, AdvH } from "@/components/lesson/AdvancedSection";
import { MathBlock, MathInline } from "@/components/lesson/math";
import { CodeBlock } from "@/components/lesson/CodeBlock";
import { QKVWalkthrough } from "@/components/artifacts/QKVWalkthrough";
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

      <AdvancedSection>
        <P>
          The whole transformer rests on one equation. Here it is, then a step-through of the actual matrices, then
          the code.
        </P>

        <AdvH>The math</AdvH>
        <MathBlock tex={String.raw`\mathrm{Attention}(Q, K, V) = \mathrm{softmax}\!\left(\frac{QK^{\top}}{\sqrt{d_k}}\right) V`} />
        <P>
          Each token&apos;s embedding row in <MathInline tex={String.raw`X`} /> is projected three ways with learned
          matrices: <MathInline tex={String.raw`Q = XW_Q`} />, <MathInline tex={String.raw`K = XW_K`} />,{" "}
          <MathInline tex={String.raw`V = XW_V`} />. The score between token <MathInline tex={String.raw`i`} /> and
          token <MathInline tex={String.raw`j`} /> is the dot product <MathInline tex={String.raw`\mathbf{q}_i \cdot \mathbf{k}_j`} /> —
          literally the &ldquo;closeness&rdquo; measure from the embeddings lesson, applied between a question and an
          offer. The <MathInline tex={String.raw`\sqrt{d_k}`} /> keeps those scores from growing with vector length
          and saturating the softmax (that&apos;s the temperature slider you played with, in disguise). Each row of
          the softmax output sums to 1 — the attention percentages you saw.
        </P>
        <P>
          <Strong>Multi-head:</Strong> run <MathInline tex={String.raw`h`} /> of these in parallel with different
          learned projections, concatenate, and project back:{" "}
          <MathInline tex={String.raw`\mathrm{MultiHead}(X) = [\mathrm{head}_1; \dots; \mathrm{head}_h]\,W_O`} />.
          One head can track pronouns while another matches adjectives to nouns.
        </P>

        <AdvH>The matrices, step by step</AdvH>
        <QKVWalkthrough />

        <AdvH>The code</AdvH>
        <CodeBlock
          title="self-attention, one head"
          code={`def attention(X, Wq, Wk, Wv):
    Q, K, V = X @ Wq, X @ Wk, X @ Wv     # project each token 3 ways
    scores = Q @ K.T / sqrt(d_k)         # every query vs every key
    A = softmax(scores, axis=rows)       # each row -> weights summing to 1
    return A @ V                         # blend values by attention`}
        />
        <P>
          Note what is <Em>not</Em> in this code: any notion of word order or distance. Attention treats the sentence
          as a set — which is why transformers add <Code>positional encodings</Code> to the embeddings before this
          step, so &ldquo;dog bites man&rdquo; and &ldquo;man bites dog&rdquo; don&apos;t look identical. And in a
          decoder like ChatGPT, a <Strong>causal mask</Strong> sets every score where <MathInline tex={String.raw`j > i`} />{" "}
          to <MathInline tex={String.raw`-\infty`} /> before the softmax, so a token can only attend backwards — you
          can&apos;t peek at words you haven&apos;t written yet.
        </P>
      </AdvancedSection>
    </Prose>
  );
}
