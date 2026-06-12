import { Prose, Lead, P, H2, Strong, Em, Term, Code } from "@/components/lesson/prose";
import { AdvancedSection, AdvH } from "@/components/lesson/AdvancedSection";
import { MathBlock, MathInline } from "@/components/lesson/math";
import { CodeBlock } from "@/components/lesson/CodeBlock";
import { NetworkFlow } from "@/components/artifacts/NetworkFlow";
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

      <AdvancedSection>
        <P>
          Time to open the network up completely. Below you can watch the two passes that all of deep learning
          alternates between — data flowing forward, blame flowing backward — with every number visible.
        </P>

        <ArtifactFrame
          title="Network Flow — the X-ray"
          hint="Switch Forward/Backward · click any node for its arithmetic"
          caption="Forward: pulses carry the signal left to right; each node shows its activation. Backward: pulses carry blame right to left; each node shows its δ — its share of the error."
        >
          <NetworkFlow />
        </ArtifactFrame>

        <AdvH>The math — forward</AdvH>
        <P>
          A layer is just the neuron equation done in bulk. Stack the weights into a matrix{" "}
          <MathInline tex={String.raw`W^{(l)}`} /> and the whole layer becomes one line:
        </P>
        <MathBlock tex={String.raw`\mathbf{a}^{(l)} = \varphi\!\left(W^{(l)}\,\mathbf{a}^{(l-1)} + \mathbf{b}^{(l)}\right)`} />
        <P>
          where <MathInline tex={String.raw`\varphi`} /> is the squash (<Code>tanh</Code> in our hidden layers,
          sigmoid at the output). A &ldquo;network&rdquo; is nothing more than this line applied{" "}
          <MathInline tex={String.raw`L`} /> times in a row. That&apos;s also why GPUs matter: it&apos;s all
          matrix multiplication.
        </P>

        <AdvH>The math — backward (backpropagation)</AdvH>
        <P>
          Training needs <MathInline tex={String.raw`\partial \mathcal{L} / \partial w`} /> for <Em>every</Em>{" "}
          weight. The chain rule gives them all in one backward sweep. Define each node&apos;s{" "}
          <Term define="delta — how much the loss would change if this node's pre-activation changed. Its share of the blame.">error signal</Term>{" "}
          <MathInline tex={String.raw`\boldsymbol{\delta}`} />. At the output (sigmoid + cross-entropy) it collapses
          to something almost insultingly clean, and then blame flows backwards through the same weights the signal
          flowed forwards through:
        </P>
        <MathBlock tex={String.raw`\boldsymbol{\delta}^{(L)} = \hat{y} - y \qquad\quad \boldsymbol{\delta}^{(l)} = \left(W^{(l+1)\top}\boldsymbol{\delta}^{(l+1)}\right)\odot\left(1 - \mathbf{a}^{(l)2}\right)`} />
        <P>
          (the <MathInline tex={String.raw`1-\mathbf{a}^2`} /> factor is just <Code>tanh</Code>&apos;s derivative).
          Every weight&apos;s gradient is then local — the blame arriving at its destination times the signal that
          left its source:
        </P>
        <MathBlock tex={String.raw`\frac{\partial \mathcal{L}}{\partial W^{(l)}_{ji}} = \delta^{(l)}_j \, a^{(l-1)}_i`} />

        <AdvH>The code</AdvH>
        <P>
          This is the actual training loop inside the Spiral Classifier above — it has been running in your browser
          this whole time:
        </P>
        <CodeBlock
          title="one epoch of backprop (the Spiral Classifier's real loop)"
          code={`def train_epoch(net, data, lr):
    grads = zeros_like(net)
    for (x, y) in data:
        acts = forward(net, x)            # store every layer's output
        delta[last] = acts[last] - y      # output blame: y_hat - y
        for l in reversed(hidden_layers):
            delta[l] = (W[l+1].T @ delta[l+1]) * (1 - acts[l]**2)
        for l in all_layers:              # local gradients
            grads.W[l] += outer(delta[l], acts[l-1])
            grads.b[l] += delta[l]
    net -= lr * grads / len(data)         # the same downhill nudge as ever`}
        />
        <P>
          Notice what backprop really is: bookkeeping. No new learning idea beyond Lesson 3&apos;s &ldquo;nudge
          downhill&rdquo; — just the chain rule organising who gets how much blame, computed in one backward pass
          instead of billions of separate experiments.
        </P>
      </AdvancedSection>
    </Prose>
  );
}
