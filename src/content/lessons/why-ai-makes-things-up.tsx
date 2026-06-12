import { Prose, Lead, P, H2, Strong, Em, Term, Code } from "@/components/lesson/prose";
import { AdvancedSection, AdvH } from "@/components/lesson/AdvancedSection";
import { MathBlock, MathInline } from "@/components/lesson/math";
import { CodeBlock } from "@/components/lesson/CodeBlock";
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

      <AdvancedSection>
        <P>
          Hallucination isn&apos;t a mystery once you look at the objective. The model was optimised for one number —
          and truth wasn&apos;t it.
        </P>

        <AdvH>The math — what training actually rewards</AdvH>
        <P>Pretraining maximises the likelihood of the corpus:</P>
        <MathBlock tex={String.raw`\max_{\theta} \; \sum_{t} \log P_{\theta}\bigl(x_t \mid x_{<t}\bigr)`} />
        <P>
          Nothing in that sum checks facts — it rewards <Em>matching the distribution of text</Em>. If the corpus
          contains a thousand confident movie-plot summaries and zero examples of &ldquo;I don&apos;t know that
          film,&rdquo; then for a made-up title the highest-likelihood continuation is a confident plot. The model
          is doing its job perfectly; the job was never truth.
        </P>

        <AdvH>The math — measuring overconfidence</AdvH>
        <P>
          A model is <Term define="A model is calibrated when, among all answers it gives with confidence p, a fraction p are actually correct.">calibrated</Term>{" "}
          when confidence matches accuracy: <MathInline tex={String.raw`P(\text{correct} \mid \text{conf} = p) = p`} />.
          The standard score is the Expected Calibration Error — bucket predictions by confidence, compare each
          bucket&apos;s average confidence to its actual accuracy:
        </P>
        <MathBlock tex={String.raw`\mathrm{ECE} = \sum_{b=1}^{B} \frac{n_b}{N}\,\bigl|\, \mathrm{acc}(b) - \mathrm{conf}(b) \,\bigr|`} />
        <P>
          The game you just played was an informal ECE probe: the answers all <Em>felt</Em> ~90% confident, but the
          accuracy in the set was 20%. That gap is the hallucination problem in one number. (A subtle empirical
          fact: base models are often reasonably calibrated, and the politeness training from the RLHF lesson can
          make calibration <Em>worse</Em> — humans up-vote confident-sounding answers.)
        </P>

        <AdvH>The code</AdvH>
        <CodeBlock
          title="expected calibration error"
          code={`def ece(predictions, n_buckets=10):
    buckets = group_by(predictions, key=lambda p: floor(p.conf * n_buckets))
    total = 0
    for b in buckets:
        acc  = mean(p.was_correct for p in b)
        conf = mean(p.conf for p in b)
        total += len(b) / len(predictions) * abs(acc - conf)
    return total   # 0 = honest confidence; big = confidently wrong`}
        />
        <P>
          The practical mitigations all share one shape — stop asking the weights to be a database: retrieval (give
          it documents to quote), tools (give it a calculator), and abstention training (reward &ldquo;I&apos;m not
          sure&rdquo;). The first two are exactly the final chapter of this course.
        </P>
      </AdvancedSection>
    </Prose>
  );
}
