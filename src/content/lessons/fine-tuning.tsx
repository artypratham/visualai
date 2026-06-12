import { Prose, Lead, P, H2, Strong, Em, Term, Code } from "@/components/lesson/prose";
import { AdvancedSection, AdvH } from "@/components/lesson/AdvancedSection";
import { MathBlock, MathInline } from "@/components/lesson/math";
import { CodeBlock } from "@/components/lesson/CodeBlock";
import { Callout } from "@/components/lesson/Callout";
import { ArtifactFrame } from "@/components/lesson/ArtifactFrame";
import { FineTuning } from "@/components/artifacts/FineTuning";

export function FineTuningContent() {
  return (
    <Prose>
      <Lead>
        Last chapter left us with a raw next-token engine — a brilliant autocomplete that just{" "}
        <Em>rambles</Em>. Here&apos;s the surprisingly small step that turns it into something that actually answers
        you.
      </Lead>

      <P>
        Out of pretraining you get a <Strong>base model</Strong>: it has read a huge slice of the internet and is
        astonishing at continuing text. But that&apos;s the only thing it knows how to do — <Em>continue</Em>. Ask it
        a question and it won&apos;t answer; it&apos;ll just predict more text that looks like your question, because
        on the web a question is usually followed by… more questions. Watch the difference for yourself:
      </P>

      <ArtifactFrame
        title="Fine-Tuning Bench"
        hint="Drag the slider · switch the course"
        caption="Left: the base model just autocompletes. Right: the same model after you show it a few examples — now it follows the instruction."
      >
        <FineTuning />
      </ArtifactFrame>

      <Callout tone="try">
        <p>
          Start at <Strong>0 examples</Strong> — the fine-tuned side is identical to the base model: pure rambling.
          Now drag the slider up. Around a dozen examples it &ldquo;clicks&rdquo; and starts obeying. Then switch the{" "}
          <Strong>course</Strong> from Helpful Assistant to Pirate or Haiku — same machine, different handful of
          examples, completely different behaviour.
        </p>
      </Callout>

      <H2>From autocomplete to assistant</H2>
      <P>
        That second step is{" "}
        <Term define="Supervised fine-tuning (SFT): continue training a base model on a curated set of (instruction, ideal response) pairs so it learns to follow instructions.">
          supervised fine-tuning
        </Term>
        : you keep training the base model, but now on a curated set of <Strong>(instruction → ideal response)</Strong>{" "}
        pairs written by humans. It&apos;s tiny compared to pretraining — thousands of examples, not trillions of
        words — which is exactly why it&apos;s called a <Em>fine</Em> tune. You&apos;re not rebuilding the model;
        you&apos;re nudging a finished one toward a job.
      </P>

      <Callout tone="key">
        <p>
          Pretraining teaches the model <Strong>language and facts</Strong>. Fine-tuning teaches it{" "}
          <Strong>behaviour and format</Strong> — how to take an instruction and respond. It barely adds knowledge;
          it unlocks the knowledge that was already in there, in a shape you can talk to.
        </p>
      </Callout>

      <P>
        The same lever gives you specialists. Feed it medical Q&amp;A and you get a clinical assistant; feed it your
        company&apos;s support tickets and you get a support bot. The Pirate and the Lawyer in the demo aren&apos;t a
        joke — they&apos;re the literal mechanism, just with a sillier dataset.
      </P>

      <Callout tone="recap">
        <p>
          But fine-tuning only ever <Em>shows</Em> the model good answers. It never learns which of two perfectly
          good answers a human would actually <Strong>prefer</Strong> — shorter or longer, blunt or gentle, cautious
          or confident. Teaching it that preference is the next, stranger step: learning from feedback.
        </p>
      </Callout>

      <AdvancedSection>
        <P>
          Mechanically, fine-tuning is almost an anticlimax: it&apos;s pretraining&apos;s loss on a different —
          tiny, curated — dataset. All of the craft lives in the data and in <Em>which</Em> weights you let move.
        </P>

        <AdvH>The math</AdvH>
        <P>
          Supervised fine-tuning minimises the same next-token cross-entropy as pretraining, but only over the{" "}
          <Strong>response</Strong> tokens, conditioned on the instruction:
        </P>
        <MathBlock tex={String.raw`\mathcal{L}_{\mathrm{SFT}} = -\sum_{(x,\, y)} \; \sum_{t} \log P_{\theta}\bigl(y_t \mid x,\; y_{<t}\bigr)`} />
        <P>
          The instruction <MathInline tex={String.raw`x`} /> is masked out of the loss — the model isn&apos;t graded
          on parroting your question, only on producing the answer. A few thousand high-quality pairs flip a
          continuer into a follower because the capability was already inside the base model; SFT just makes one
          region of behaviour overwhelmingly likely.
        </P>

        <AdvH>The math — fine-tuning without touching the weights (LoRA)</AdvH>
        <P>
          Updating every parameter of a 70B model is expensive.{" "}
          <Term define="Low-Rank Adaptation: freeze the original weights, learn a tiny low-rank correction on top.">LoRA</Term>{" "}
          freezes each original weight matrix <MathInline tex={String.raw`W`} /> and learns a correction that is
          forced to be low-rank:
        </P>
        <MathBlock tex={String.raw`W' = W + \underbrace{B\,A}_{\text{the adapter}}, \qquad B \in \mathbb{R}^{d \times r},\; A \in \mathbb{R}^{r \times d},\; r \ll d`} />
        <P>
          With <MathInline tex={String.raw`r = 8`} /> against <MathInline tex={String.raw`d = 4096`} />, the
          trainable parameters drop by ~99.7%. A pirate-voice adapter fits in megabytes, and you can hot-swap
          personalities over one frozen base — which is, in spirit, exactly what the course picker in the artifact
          is doing.
        </P>

        <AdvH>The code</AdvH>
        <CodeBlock
          title="the whole SFT loop"
          code={`def fine_tune(base_model, dataset, lr=1e-5, epochs=3):
    model = copy(base_model)            # or: freeze it + attach LoRA adapters
    for _ in range(epochs):
        for (instruction, response) in dataset:
            tokens = template(instruction, response)
            loss = cross_entropy(model(tokens),
                                 targets=response_tokens_only(tokens))
            descend(model, loss, lr)    # tiny lr — don't bulldoze the base
    return model`}
        />
        <P>
          The danger is <Em>catastrophic forgetting</Em>: push too hard on five thousand pirate examples and the
          model starts losing general knowledge — the same gradient steps that carve in the new style overwrite the
          old. Hence the gentle learning rate (note the <Code>1e-5</Code>, a hundredth of pretraining&apos;s), the
          few epochs, and — in LoRA&apos;s case — the structural guarantee that the base weights cannot move at all.
        </P>
      </AdvancedSection>
    </Prose>
  );
}
