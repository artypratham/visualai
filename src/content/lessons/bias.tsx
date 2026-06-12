import { Prose, Lead, P, H2, Strong, Em, Term, Code } from "@/components/lesson/prose";
import { AdvancedSection, AdvH } from "@/components/lesson/AdvancedSection";
import { MathBlock, MathInline } from "@/components/lesson/math";
import { CodeBlock } from "@/components/lesson/CodeBlock";
import { Callout } from "@/components/lesson/Callout";
import { ArtifactFrame } from "@/components/lesson/ArtifactFrame";
import { BiasedMachine } from "@/components/artifacts/BiasedMachine";

export function BiasContent() {
  return (
    <Prose>
      <Lead>
        A model learns from examples — which means it learns <Em>whatever the examples teach it</Em>, including
        the unfairness baked into them. An AI is a mirror held up to its data.
      </Lead>

      <P>
        Imagine training a hiring model on a company&apos;s past decisions. If that history quietly favoured one
        group of people, the &ldquo;objective&rdquo; model doesn&apos;t correct the injustice — it{" "}
        <Strong>learns it as a rule</Strong> and applies it to every future applicant, at scale, with a veneer of
        mathematical neutrality. Below, two groups have the exact same range of skill. Watch what a biased history
        does.
      </P>

      <ArtifactFrame
        title="Biased Machine"
        hint="Slide the bias up, then hit “Remove the bias”"
        caption="The model has no idea what's fair. It only knows the past — and it copies it perfectly."
      >
        <BiasedMachine />
      </ArtifactFrame>

      <Callout tone="try">
        <p>
          With bias set to <Strong>none</Strong>, both groups face the same bar — fair. Now slide the{" "}
          <Strong>bias</Strong> up: the model quietly raises the bar for Group B, the two acceptance rates split
          apart, and qualified Group-B people (ringed in red) start getting rejected. Then click{" "}
          <Strong>Remove the bias</Strong> and watch fairness snap back. The model didn&apos;t change — the data did.
        </p>
      </Callout>

      <H2>The model isn&apos;t malicious — that&apos;s the problem</H2>
      <P>
        There&apos;s no villain here. The model has no concept of fairness, intent, or harm. It simply found the
        statistical pattern in its <Term define="The examples a model learns from. If they're skewed, the model's rules are skewed.">training data</Term>{" "}
        and reproduced it. <Em>Bias in, bias out.</Em> And it&apos;s sneaky: just deleting the &ldquo;group&rdquo;
        label often doesn&apos;t help, because other features (a postcode, a name, a school) quietly act as
        stand-ins for it.
      </P>

      <Callout tone="key">
        <p>
          A model is a mirror of its data. When that data encodes society&apos;s past unfairness, the model
          doesn&apos;t just inherit the bias — it <Strong>automates and scales</Strong> it, and wraps it in a layer
          of apparent objectivity that makes it harder to challenge. Fixing AI bias is usually about fixing the
          data and the goals, not the maths.
        </p>
      </Callout>

      <P>
        This is why the messy, human questions — <Em>where did this data come from? who&apos;s in it? who&apos;s
        missing?</Em> — matter as much as any algorithm. Real systems have denied loans, mis-ranked résumés, and
        mis-scored medical risk this exact way.
      </P>

      <Callout tone="recap">
        <p>
          Overfitting and bias are both failures of <Em>learning from data</Em>. The next failure is special to
          language models, and you&apos;ve probably already met it: an AI that states something completely false
          with total confidence. Why does it make things up? That&apos;s next.
        </p>
      </Callout>

      <AdvancedSection>
        <P>
          &ldquo;Fair&rdquo; sounds like one idea. Formalise it and it splits into several — and they turn out to be
          mathematically incompatible. This is why AI fairness is a research field and not a checkbox.
        </P>

        <AdvH>The math — competing definitions</AdvH>
        <P>
          Let <MathInline tex={String.raw`\hat{Y}`} /> be the model&apos;s decision and{" "}
          <MathInline tex={String.raw`A`} /> the group attribute. <Strong>Demographic parity</Strong> demands equal
          acceptance rates:
        </P>
        <MathBlock tex={String.raw`P(\hat{Y} = 1 \mid A = a) = P(\hat{Y} = 1 \mid A = b)`} />
        <P>
          <Strong>Equalised odds</Strong> demands equal error rates instead — among the truly qualified, the same
          chance of acceptance (and likewise among the unqualified):
        </P>
        <MathBlock tex={String.raw`P(\hat{Y} = 1 \mid Y = y,\, A = a) = P(\hat{Y} = 1 \mid Y = y,\, A = b) \quad \text{for } y \in \{0, 1\}`} />
        <P>
          A third asks that confidence scores mean the same thing for both groups (<Em>calibration</Em>). The
          impossibility result: when base rates differ between groups, <Strong>no classifier can satisfy all of
          these at once</Strong> — you must choose which fairness to enforce, and that choice is a values question,
          not a math question. The artifact&apos;s red-ringed dots are an equalised-odds violation: qualified people
          with different acceptance odds depending on group.
        </P>

        <AdvH>The code</AdvH>
        <CodeBlock
          title="auditing a model for disparate impact"
          code={`def fairness_audit(model, data):
    for group in groups(data):
        rate    = mean(model(x) == 1 for x in group)         # selection rate
        tpr     = mean(model(x) == 1 for x in group if y(x) == 1)
        fpr     = mean(model(x) == 1 for x in group if y(x) == 0)
        report(group, rate, tpr, fpr)
    # four-fifths rule of thumb: min(rate) / max(rate) < 0.8 -> red flag
    # unequal tpr/fpr across groups -> equalised-odds violation`}
        />
        <P>
          And the trap from the lesson, formally: dropping the <MathInline tex={String.raw`A`} /> column is not
          enough, because correlated features keep <MathInline tex={String.raw`I(X; A) > 0`} /> — the data still
          carries information about the group (postcodes, schools, names). The model will find it, because finding
          correlations is the only thing it does. Auditing outcomes, not inputs, is the honest test.
        </P>
      </AdvancedSection>
    </Prose>
  );
}
