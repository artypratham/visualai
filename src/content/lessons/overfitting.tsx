import { Prose, Lead, P, H2, Strong, Em, Term } from "@/components/lesson/prose";
import { Callout } from "@/components/lesson/Callout";
import { ArtifactFrame } from "@/components/lesson/ArtifactFrame";
import { OverfitPlayground } from "@/components/artifacts/OverfitPlayground";

export function OverfittingContent() {
  return (
    <Prose>
      <Lead>
        A student who memorises last year&apos;s exam answers looks brilliant — until the questions change. Models
        do exactly this, and it&apos;s the most important failure to understand: overfitting.
      </Lead>

      <P>
        Back in the fitting lessons, the whole goal seemed to be &ldquo;make the error on your data small.&rdquo;
        But that&apos;s a trap. You don&apos;t actually care how well a model does on data you&apos;ve already
        got — you care how it does on data it has <Em>never seen</Em>. That&apos;s the only thing that matters in
        the real world.
      </P>
      <P>
        So we play fair: hide some of the data. The <Strong>teal</Strong> dots below are the model&apos;s study
        material; the <Strong>hollow</Strong> dots are a held-back exam it never trains on. Now turn up the
        model&apos;s complexity and watch the two come apart.
      </P>

      <ArtifactFrame
        title="Overfit Playground"
        hint="Drag the complexity slider all the way up"
        caption="Training error always falls as complexity rises. Test error is the one that tells the truth."
      >
        <OverfitPlayground />
      </ArtifactFrame>

      <Callout tone="try">
        <p>
          At degree <Strong>1–2</Strong> the line is too stiff to follow the curve — both errors stay high
          (<Em>underfitting</Em>). Around <Strong>3–4</Strong> it nails the real pattern. Now crank it to{" "}
          <Strong>10+</Strong>: the curve contorts to pass through every single teal dot, training error dives
          toward zero — and the test error <Em>explodes</Em>. Bump the noise up and it gets even more dramatic.
        </p>
      </Callout>

      <H2>The goal was never to fit the data</H2>
      <P>
        The real target is <Term define="How well a model performs on new, unseen data — the only thing that actually matters.">generalisation</Term>:
        doing well on the unseen exam. A model with too much capacity doesn&apos;t learn the underlying pattern —
        it memorises the training points, <Em>including the random noise</Em>, and that memorised noise is useless
        (worse than useless) on anything new. The gap between the low training error and the high test error{" "}
        <Strong>is</Strong> the overfitting.
      </P>

      <Callout tone="key">
        <p>
          Low training error is not the goal — low error on <Em>new</Em> data is. Make a model complex enough and
          it will memorise its training set perfectly while failing in the wild. This is why every serious AI is
          judged on held-out data it was never allowed to study.
        </p>
      </Callout>

      <P>
        The fix isn&apos;t always &ldquo;bigger model.&rdquo; Often it&apos;s the opposite — a simpler model, or
        more data, or techniques that deliberately stop a model from memorising. Knowing when your model is
        fooling you is half the skill.
      </P>

      <Callout tone="recap">
        <p>
          Overfitting is the first way AI quietly misleads you: it looks perfect on the data you tested it with,
          and falls apart on everything else. The next trap is sneakier still — it&apos;s not about the model&apos;s
          complexity, but about the <Strong>data we feed it</Strong>. If that data is skewed, the model learns the
          skew. That&apos;s bias, and it&apos;s next.
        </p>
      </Callout>
    </Prose>
  );
}
