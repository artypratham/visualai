import { Prose, Lead, P, H2, Strong, Em, Term, Code } from "@/components/lesson/prose";
import { AdvancedSection, AdvH } from "@/components/lesson/AdvancedSection";
import { MathBlock, MathInline } from "@/components/lesson/math";
import { CodeBlock } from "@/components/lesson/CodeBlock";
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

      <AdvancedSection>
        <P>
          The teal/hollow split you played with is the most important experimental design in machine learning. Here
          is its formal skeleton — and the exact equations the artifact solves.
        </P>

        <AdvH>The math — two different errors</AdvH>
        <P>
          What we minimise is the <Em>training</Em> (empirical) risk; what we care about is the <Em>true</Em> risk on
          unseen data:
        </P>
        <MathBlock tex={String.raw`\hat{R}(f) = \frac{1}{N}\sum_{i=1}^{N} \ell\bigl(f(x_i), y_i\bigr) \qquad\quad R(f) = \mathbb{E}_{(x,y)}\bigl[\ell\bigl(f(x), y\bigr)\bigr]`} />
        <P>
          Overfitting is the gap <MathInline tex={String.raw`R - \hat{R}`} /> growing as capacity grows. The classic
          decomposition of expected test error splits it into three parts:
        </P>
        <MathBlock tex={String.raw`\mathbb{E}\bigl[(y - \hat{f}(x))^2\bigr] = \underbrace{\text{Bias}^2}_{\text{too simple}} + \underbrace{\text{Variance}}_{\text{too sensitive to the sample}} + \underbrace{\sigma^2}_{\text{irreducible noise}}`} />
        <P>
          Degree 1–2 in the artifact = high bias. Degree 10+ = high variance: re-roll the data and the wiggly curve
          changes wildly while the smooth one barely moves. The sweet spot minimises the <Em>sum</Em>.
        </P>

        <AdvH>The math — the fix the artifact secretly uses</AdvH>
        <P>
          <Term define="Adding a penalty on weight size to the loss, discouraging extreme fits.">Regularisation</Term>{" "}
          shrinks capacity smoothly instead of chopping it: penalise big coefficients,
        </P>
        <MathBlock tex={String.raw`\mathcal{J}(\mathbf{w}) = \sum_i \bigl(\hat{y}_i - y_i\bigr)^2 + \lambda \lVert \mathbf{w} \rVert^2 \;\;\Rightarrow\;\; \mathbf{w} = \bigl(A^{\top}A + \lambda I\bigr)^{-1} A^{\top}\mathbf{y}`} />
        <P>
          Fun fact: the playground above genuinely solves this <Em>ridge regression</Em> with a tiny{" "}
          <MathInline tex={String.raw`\lambda = 10^{-7}`} /> — just enough to keep the matrix invertible. Crank{" "}
          <MathInline tex={String.raw`\lambda`} /> up and even a degree-12 polynomial calms down.
        </P>

        <AdvH>The code</AdvH>
        <CodeBlock
          title="fit + honest evaluation (the artifact's actual procedure)"
          code={`def fit_poly(train, degree, lam=1e-7):
    A = [[x**j for j in range(degree + 1)] for (x, y) in train]
    w = solve(A.T @ A + lam * I, A.T @ y_train)   # ridge normal equations
    return w

train_err = mse(w, train)   # always falls as degree rises
test_err  = mse(w, test)    # the number that tells the truth
# never let the model see 'test' during fitting. ever.`}
        />
        <P>
          Real practice adds one more split — train / <Em>validation</Em> / test — because choosing the degree (or
          any knob) by peeking at test error is itself a slow leak of information. Tune on validation; touch test
          once, at the end. And the modern twist: very large neural networks can break this tidy U-shaped story
          (&ldquo;double descent&rdquo;) — test error sometimes falls <Em>again</Em> past the interpolation point.
          The train/test discipline is exactly how that surprise was discovered.
        </P>
      </AdvancedSection>
    </Prose>
  );
}
