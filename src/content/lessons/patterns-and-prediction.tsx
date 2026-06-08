import { Prose, Lead, P, H2, Strong, Em, Term } from "@/components/lesson/prose";
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
    </Prose>
  );
}
