import { Prose, Lead, P, H2, Strong, Em, Term, Code } from "@/components/lesson/prose";
import { AdvancedSection, AdvH } from "@/components/lesson/AdvancedSection";
import { MathBlock, MathInline } from "@/components/lesson/math";
import { CodeBlock } from "@/components/lesson/CodeBlock";
import { Callout } from "@/components/lesson/Callout";
import { ArtifactFrame } from "@/components/lesson/ArtifactFrame";
import { NextTokenPredictor } from "@/components/artifacts/NextTokenPredictor";

export function LargeLanguageModelsContent() {
  return (
    <Prose>
      <Lead>
        Here&apos;s the secret that powers ChatGPT, and it&apos;s almost disappointingly simple: it guesses the
        next word. Then it does it again. That&apos;s the entire trick — done very, very well, at a scale
        that&apos;s hard to imagine.
      </Lead>

      <P>
        Everything you&apos;ve built converges here. A{" "}
        <Term define="A neural network trained to predict the next piece of text, scaled to billions of weights and trained on enormous amounts of writing.">
          large language model
        </Term>{" "}
        takes the text so far and predicts what comes next. It doesn&apos;t blurt out one word, though — it
        produces a <Strong>probability for every word it knows</Strong>. Then something picks one, adds it to the
        text, and the whole thing runs again on the now-longer text. Be that something:
      </P>

      <ArtifactFrame
        title="Next-Token Predictor"
        hint="You are the model — pick the next word"
        caption="A toy model, but the loop is the real one: read the text, score every next word, pick one, repeat. That loop is ChatGPT."
      >
        <NextTokenPredictor />
      </ArtifactFrame>

      <Callout tone="try">
        <p>
          Click words to write a sentence yourself. Then try the two extremes. Hit <Strong>Most likely</Strong>{" "}
          over and over — safe, but flat and a little robotic. Now push <Strong>Temperature</Strong> up and hit{" "}
          <Strong>Sample</Strong> — suddenly it&apos;s adventurous, surprising, sometimes nonsense. Press{" "}
          <Strong>Auto-write</Strong> and watch it generate on its own. That temperature dial is the exact same
          &ldquo;creativity&rdquo; knob behind ChatGPT.
        </p>
      </Callout>

      <H2>Predicting, then feeding back its own words</H2>
      <P>
        Notice the loop: each word the model picks becomes part of the input for the <Em>next</Em> prediction.
        It writes by reading what it has written so far — over and over. This feed-it-back-in style is called{" "}
        <Term define="Generating one piece at a time, each new piece conditioned on everything generated before it.">
          autoregression
        </Term>
        , and it&apos;s how a next-word predictor turns into something that writes whole paragraphs.
      </P>
      <P>
        Two small truths behind the curtain. First, models predict{" "}
        <Term define="A chunk of text — often a word or part of a word — that the model treats as one unit.">
          tokens
        </Term>
        , not always whole words (&ldquo;running&rdquo; might be <Em>run</Em> + <Em>ning</Em>). Second, those
        probabilities aren&apos;t hand-set like our toy&apos;s — they pour out of a deep network full of the{" "}
        attention layers and embeddings from the last few lessons, trained by gradient descent on a staggering
        amount of text.
      </P>

      <Callout tone="key">
        <p>
          A large language model is a next-token predictor run in a loop. <Strong>Temperature</Strong> controls
          how boldly it samples: low stays on the safest, highest-probability path; high takes risks. Everything
          that feels like reasoning, style, or knowledge is this one mechanism, scaled up beyond intuition.
        </p>
      </Callout>

      <P>
        This also explains why these models sometimes <Em>make things up</Em>. They&apos;re built to produce the
        most <Strong>plausible-sounding</Strong> next word — not the most <Strong>true</Strong> one. When a
        confident-but-wrong answer is the statistically natural continuation, that&apos;s exactly what you get.
        Knowing that is the difference between using AI well and being fooled by it.
      </P>

      <Callout tone="recap">
        <p>
          That&apos;s the whole ladder. You started by teaching a machine from examples, watched everything
          dissolve into numbers, fit a line, stacked neurons into networks, turned words into geometry, let them
          pay attention to each other — and arrived at the machine guessing the next word that is ChatGPT. AI is
          no longer magic to you. It&apos;s a set of ideas you&apos;ve felt with your own hands. Welcome to the
          other side. ✦
        </p>
      </Callout>

      <AdvancedSection>
        <P>
          The loop you just hand-cranked has a precise probabilistic skeleton. Here it is.
        </P>

        <AdvH>The math</AdvH>
        <P>
          A language model factorises the probability of a whole text into one next-token prediction per position —
          this single equation <Em>is</Em> the product spec of every GPT:
        </P>
        <MathBlock tex={String.raw`P(x_1, \dots, x_T) = \prod_{t=1}^{T} P\bigl(x_t \mid x_1, \dots, x_{t-1}\bigr)`} />
        <P>
          Training maximises the probability of real text — equivalently, minimises{" "}
          <Term define="The negative log-probability the model assigns to the true next token, averaged over text.">cross-entropy</Term>:
        </P>
        <MathBlock tex={String.raw`\mathcal{L} = -\sum_{t} \log P\bigl(x_t \mid x_{<t}\bigr)`} />
        <P>
          At generation time the model emits a raw score (a <Em>logit</Em>) <MathInline tex={String.raw`z_i`} /> per
          vocabulary token, and the temperature <MathInline tex={String.raw`T`} /> you slid reshapes them before the
          softmax:
        </P>
        <MathBlock tex={String.raw`P(\text{token } i) = \frac{e^{z_i / T}}{\sum_j e^{z_j / T}}`} />
        <P>
          As <MathInline tex={String.raw`T \to 0`} /> the distribution collapses onto the argmax (greedy, repetitive);
          as <MathInline tex={String.raw`T`} /> grows it flattens toward uniform (chaotic). Real systems also clip the
          tail before sampling: <Strong>top-k</Strong> keeps only the k most likely tokens; <Strong>top-p</Strong>{" "}
          keeps the smallest set whose probabilities sum past p (e.g. 0.9), then renormalises.
        </P>

        <AdvH>The code</AdvH>
        <CodeBlock
          title="autoregressive generation (the artifact's loop, formalised)"
          code={`def generate(model, tokens, T, max_new):
    for _ in range(max_new):
        logits = model(tokens)             # one score per vocab token
        probs = softmax(logits[-1] / T)    # temperature reshapes
        probs = top_p_filter(probs, p=0.9) # clip the long tail
        nxt = sample(probs)                # the dice roll
        tokens.append(nxt)                 # feed it back in
        if nxt == END:
            break
    return tokens`}
        />
        <P>
          Cost note: <Code>model(tokens)</Code> re-reads the whole prefix each step — attention over t tokens costs{" "}
          <MathInline tex={String.raw`O(t^2)`} />, which is why long outputs are slow and why every production system
          caches the K and V matrices from the attention lesson (the &ldquo;KV cache&rdquo;) instead of recomputing
          them per token.
        </P>
      </AdvancedSection>
    </Prose>
  );
}
