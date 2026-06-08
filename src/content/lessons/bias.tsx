import { Prose, Lead, P, H2, Strong, Em, Term } from "@/components/lesson/prose";
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
    </Prose>
  );
}
