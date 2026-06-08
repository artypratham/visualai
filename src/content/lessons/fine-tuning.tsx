import { Prose, Lead, P, H2, Strong, Em, Term } from "@/components/lesson/prose";
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
    </Prose>
  );
}
