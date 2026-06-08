import { Prose, Lead, P, H2, Strong, Em, Term } from "@/components/lesson/prose";
import { Callout } from "@/components/lesson/Callout";
import { ArtifactFrame } from "@/components/lesson/ArtifactFrame";
import { ConfidentlyWrong } from "@/components/artifacts/ConfidentlyWrong";

export function WhyAiMakesThingsUpContent() {
  return (
    <Prose>
      <Lead>
        Here&apos;s the unsettling part of how language models work: they are built to produce text that{" "}
        <Em>sounds</Em> right, with no built-in sense of whether it <Em>is</Em> right. When those two part ways,
        you get a confident lie.
      </Lead>

      <P>
        Recall the whole mechanism: a language model picks the most plausible next token, over and over. Usually
        the most plausible continuation is also true, so it&apos;s helpful. But when the most likely-sounding
        answer happens to be <Strong>false</Strong>, the model says the false thing — just as fluently, just as
        confidently. Put it to the test:
      </P>

      <ArtifactFrame
        title="Confidently Wrong"
        hint="Pick a question, then fact-check the answer"
        caption="The confidence bar barely flinches between the true answers and the fabricated ones."
      >
        <ConfidentlyWrong />
      </ArtifactFrame>

      <Callout tone="try">
        <p>
          Ask for Australia&apos;s capital — it confidently says <Em>Sydney</Em> (the famous city) instead of
          Canberra. Ask it to count the R&apos;s in strawberry, or to summarise a film that doesn&apos;t exist, and
          it invents a tidy, confident answer. <Strong>Fact-check</Strong> each one. Then notice: the confidence
          meter looks the same whether it nailed it or made it up.
        </p>
      </Callout>

      <H2>Why it can&apos;t just say &ldquo;I don&apos;t know&rdquo;</H2>
      <P>
        This behaviour is called a{" "}
        <Term define="When a model generates fluent, confident information that is false or fabricated.">hallucination</Term>,
        and it isn&apos;t a bug bolted on by accident — it falls straight out of the training. The model was
        rewarded for producing likely-sounding text, never for being calibrated about its own ignorance. It has no
        internal fact-checker and no reliable &ldquo;I&apos;m not sure&rdquo; signal. A made-up movie plot is just
        as easy to continue as a real one.
      </P>

      <Callout tone="key">
        <p>
          Fluency and confidence are <Strong>not</Strong> evidence of truth. A language model returns the most
          probable-sounding answer; when plausibility and accuracy diverge, it hands you a confident fabrication.
          Facts, figures, quotes, and citations from an LLM always need checking against a real source.
        </p>
      </Callout>

      <P>
        This is exactly why the techniques in the final chapter matter so much — giving a model real documents to
        quote from (retrieval) or tools to actually compute with, instead of leaving it to guess. The fix for
        &ldquo;it makes things up&rdquo; is usually &ldquo;stop making it rely on memory.&rdquo;
      </P>

      <Callout tone="recap">
        <p>
          That wraps up how AI <Em>fails</Em> — overfitting, bias, and confident invention. Time for something more
          uplifting: giving AI a brand-new sense. In the next chapter it stops reading and starts <Strong>seeing</Strong>.
        </p>
      </Callout>
    </Prose>
  );
}
