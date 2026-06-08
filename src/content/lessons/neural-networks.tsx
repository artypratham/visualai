import { Prose, Lead, P, H2, Strong, Em, Term } from "@/components/lesson/prose";
import { Callout } from "@/components/lesson/Callout";
import { ArtifactFrame } from "@/components/lesson/ArtifactFrame";
import { SpiralClassifier } from "@/components/artifacts/SpiralClassifier";

export function NeuralNetworksContent() {
  return (
    <Prose>
      <Lead>
        One neuron can only draw a single straight line. That sounds like a dead end — until you discover what
        happens when you stack them. Suddenly there&apos;s almost no shape they can&apos;t wrap around.
      </Lead>

      <P>
        Look at the two spirals below. There is no straight line — no single neuron — that can ever separate
        them; they&apos;re wound together. In the last lesson that would have been game over. So how does a
        machine learn a boundary this twisted?
      </P>
      <P>
        The breakthrough is almost cheeky: <Strong>feed the output of some neurons into more neurons.</Strong>{" "}
        The first group each draw their own straight line. The next group don&apos;t see the raw data — they see
        those lines, and combine them into bends and corners. Add another group and the bends become curves and
        loops. Press <Strong>Train</Strong> and watch it happen.
      </P>

      <ArtifactFrame
        title="Spiral Classifier"
        hint="Press Train — this network learns live in your browser"
        caption="A real neural network, training by gradient descent right here. The coloured map is its evolving belief about every point on the plane."
      >
        <SpiralClassifier />
      </ArtifactFrame>

      <Callout tone="try">
        <p>
          Leave it on <Strong>Spiral</Strong> and hit <Strong>Train</Strong> — the boundary writhes and slowly
          wraps each arm. Now the revealing experiment: drag <Strong>Neurons / layer</Strong> down to{" "}
          <Strong>2</Strong> and retrain — it can&apos;t do it, there aren&apos;t enough lines to bend. Push it
          up to <Strong>9–10</Strong> and it untangles the spiral. That knob is the network&apos;s raw{" "}
          <Em>capacity</Em>.
        </p>
      </Callout>

      <H2>What a network actually is</H2>
      <P>
        That&apos;s the whole thing: neurons arranged in <Strong>layers</Strong>, where each layer&apos;s outputs
        become the next layer&apos;s inputs. The layers in the middle — the ones that never touch the data or the
        answer directly — are called{" "}
        <Term define="The layers between input and output. They learn intermediate features the next layer can build on.">
          hidden layers
        </Term>
        . A network with several of them is a{" "}
        <Term define="A neural network with multiple hidden layers. 'Deep' just means 'many layers'.">
          deep
        </Term>{" "}
        network — which is the entire origin of the phrase <Em>deep learning</Em>.
      </P>

      <H2>How does it learn all those weights?</H2>
      <P>
        Exactly like the line in Lesson 3. The network makes a guess, we measure the loss, and we nudge{" "}
        <Em>every</Em> weight a little to reduce it — gradient descent again. The only new piece is{" "}
        <Term define="The bookkeeping that figures out how much each weight contributed to the error, working backwards from the output.">
          backpropagation
        </Term>
        : the trick for fairly assigning blame for the error back through every layer, so each of the hundreds of
        weights knows which way to move. That&apos;s the math the &ldquo;epoch&rdquo; counter is grinding through.
      </P>

      <Callout tone="key">
        <p>
          A single neuron draws a line. A <Strong>layer</Strong> of them draws many lines. Stacking layers lets
          the network bend and combine those lines into essentially any shape — the more neurons and layers, the
          more intricate the boundary it can learn. Depth is what turns a line-drawer into a universal
          pattern-finder.
        </p>
      </Callout>

      <P>
        There&apos;s a catch, of course. More neurons mean more capacity but also more weights to train, slower
        learning, and a risk of <Em>memorising</Em> the data instead of finding the real pattern. Choosing the
        right size is a genuine part of the craft.
      </P>

      <Callout tone="recap">
        <p>
          This exact idea — neurons in layers, trained by gradient descent and backprop — scaled up to billions
          of weights and fed the whole internet, is what powers modern AI, including ChatGPT. But a network only
          eats numbers. So the next question is the one that unlocks language entirely:{" "}
          <Strong>how do you turn a word into numbers?</Strong>
        </p>
      </Callout>
    </Prose>
  );
}
