import { Prose, Lead, P, H2, Strong, Em, Term, Code } from "@/components/lesson/prose";
import { AdvancedSection, AdvH } from "@/components/lesson/AdvancedSection";
import { MathBlock, MathInline } from "@/components/lesson/math";
import { CodeBlock } from "@/components/lesson/CodeBlock";
import { LossLandscape3D } from "@/components/artifacts/LossLandscape3D";
import { Callout } from "@/components/lesson/Callout";
import { ArtifactFrame } from "@/components/lesson/ArtifactFrame";
import { FitTheLine } from "@/components/artifacts/FitTheLine";

export function PatternsAndPredictionContent() {
  return (
    <Prose>
      <Lead>
        Here&apos;s the secret at the heart of machine learning, and it&apos;s almost insultingly simple: make a
        guess, measure how wrong it is, nudge the guess to be a little less wrong. Repeat forever.
      </Lead>

      <P>
        Suppose every dot below is a house: how far along the street it sits (left to right) versus its price
        (bottom to top). We want a model that predicts price from position — a straight line through the cloud
        of dots. The line is our <Strong>prediction</Strong>; the dots are the <Strong>truth</Strong>.
      </P>

      <ArtifactFrame
        title="Fit the Line"
        hint="Drag the sliders, then press Train"
        caption="The red sticks are the model's mistakes. Learning is just the slow shrinking of those sticks."
      >
        <FitTheLine />
      </ArtifactFrame>

      <Callout tone="try">
        <p>
          First, fit the line <Em>by hand</Em>: drag the <Strong>slope</Strong> and <Strong>intercept</Strong>{" "}
          sliders to make the red sticks as short as you can. Watch the <Strong>error</Strong> number. Then wipe
          your effort with <Strong>Reset the line</Strong> and press <Strong>Train</Strong> — and watch the
          machine do the same thing automatically, the error graph sliding downhill.
        </p>
      </Callout>

      <H2>Measuring &ldquo;wrongness&rdquo;</H2>
      <P>
        Each red stick is the gap between a real dot and the line&apos;s guess for it — a single mistake. Add up
        all those mistakes (squared, so big misses hurt more) and you get one number that scores the whole line.
        That number is the{" "}
        <Term define="A single number measuring how wrong the model's predictions are. Lower is better.">
          loss
        </Term>
        . Low loss means a good fit. The entire goal of training is to make the loss as small as possible.
      </P>

      <H2>Rolling downhill</H2>
      <P>
        So how does <Strong>Train</Strong> find the bottom? Imagine the loss as a valley and the model standing
        somewhere on its slope. At each step it feels which way is downhill and takes a small step that way. Do
        that again and again and you roll to the bottom — the lowest-error line. This is{" "}
        <Term define="An algorithm that repeatedly steps in the direction that most reduces the loss.">
          gradient descent
        </Term>
        , and it is the engine inside essentially every modern AI.
      </P>

      <Callout tone="key">
        <p>
          Learning = repeatedly nudging the model to lower its loss. The size of each nudge is the{" "}
          <Strong>learning rate</Strong>. Crank it too high and watch the line thrash around and fly off — too
          big a step overshoots the valley. Too low and it crawls. Finding that balance is a real part of the
          job.
        </p>
      </Callout>

      <Callout tone="recap">
        <p>
          A straight line only has two knobs to tune — slope and intercept. The astonishing thing is that
          ChatGPT learns in the <Em>exact same way</Em>: guess, measure loss, nudge, repeat. It just has
          hundreds of billions of knobs instead of two. To get there, we need a knob-holder more flexible than a
          line. Meet the neuron.
        </p>
      </Callout>

      <AdvancedSection>
        <P>
          Everything you just dragged and felt has a precise form. Here it is — the same lesson, written the way a
          machine-learning engineer would write it.
        </P>

        <AdvH>The math</AdvH>
        <P>
          The model is a line <MathInline tex={String.raw`\hat{y} = wx + b`} />. The loss you watched shrink is the{" "}
          <Strong>mean squared error</Strong> over all <MathInline tex={String.raw`N`} /> points:
        </P>
        <MathBlock tex={String.raw`\mathcal{L}(w, b) = \frac{1}{N}\sum_{i=1}^{N}\bigl(\underbrace{wx_i + b}_{\text{prediction}} - \underbrace{y_i}_{\text{truth}}\bigr)^2`} />
        <P>
          &ldquo;Feeling which way is downhill&rdquo; is taking the <Term define="The vector of partial derivatives — it points in the direction of steepest increase of the loss.">gradient</Term>.
          Differentiate the loss with respect to each knob:
        </P>
        <MathBlock tex={String.raw`\frac{\partial \mathcal{L}}{\partial w} = \frac{2}{N}\sum_i (\hat{y}_i - y_i)\,x_i \qquad \frac{\partial \mathcal{L}}{\partial b} = \frac{2}{N}\sum_i (\hat{y}_i - y_i)`} />
        <P>
          One step of gradient descent moves each knob <Em>against</Em> its gradient, scaled by the learning rate{" "}
          <MathInline tex={String.raw`\eta`} />:
        </P>
        <MathBlock tex={String.raw`w \leftarrow w - \eta\,\frac{\partial \mathcal{L}}{\partial w} \qquad b \leftarrow b - \eta\,\frac{\partial \mathcal{L}}{\partial b}`} />

        <AdvH>The code</AdvH>
        <P>
          This is — almost line for line — the function that runs when you press <Strong>Train</Strong> in the artifact
          above:
        </P>
        <CodeBlock
          title="one gradient-descent step (the artifact's actual logic)"
          code={`def gradient_step(points, w, b, lr):
    gw, gb = 0, 0
    for (x, y) in points:
        error = (w*x + b) - y     # how wrong on this point
        gw += error * x           # blame assigned to the slope
        gb += error               # blame assigned to the intercept
    gw = 2 * gw / len(points)
    gb = 2 * gb / len(points)
    return w - lr*gw, b - lr*gb   # one nudge downhill`}
        />

        <AdvH>The landscape it rolls on</AdvH>
        <P>
          With two knobs the loss is a surface — every <Code>(w, b)</Code> pair has a height. Training is a ball
          rolling on it. Real models add <Strong>momentum</Strong>: keep a velocity{" "}
          <MathInline tex={String.raw`v \leftarrow \beta v - \eta \nabla \mathcal{L}`} /> and update with it, so the
          ball can coast through small dips instead of parking in them.
        </P>
        <ArtifactFrame
          title="Loss Landscape in 3D"
          hint="Drag to orbit · drop a ball"
          caption="The deep valley is the global minimum; the shallow dip is a local-minimum trap. Low momentum parks in the trap; higher momentum coasts through it."
        >
          <LossLandscape3D />
        </ArtifactFrame>
        <P>
          A line&apos;s loss surface is actually one perfect bowl — no traps. But the moment we stack neurons (next
          lessons), the landscape grows ridges, plateaus and false valleys like this one, and the learning rate +
          momentum you just tuned become the difference between converging and wandering forever.
        </P>
      </AdvancedSection>
    </Prose>
  );
}
