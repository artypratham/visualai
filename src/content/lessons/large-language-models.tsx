import { Prose, Lead, P, H2, Strong, Em, Term } from "@/components/lesson/prose";
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
    </Prose>
  );
}
