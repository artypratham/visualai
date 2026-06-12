import { Prose, Lead, P, H2, Strong, Em, Term, Code } from "@/components/lesson/prose";
import { AdvancedSection, AdvH } from "@/components/lesson/AdvancedSection";
import { MathBlock, MathInline } from "@/components/lesson/math";
import { CodeBlock } from "@/components/lesson/CodeBlock";
import { NetworkFlow } from "@/components/artifacts/NetworkFlow";
import { Callout } from "@/components/lesson/Callout";
import { ArtifactFrame } from "@/components/lesson/ArtifactFrame";
import { NeuronPlayground } from "@/components/artifacts/NeuronPlayground";

export function TheNeuronContent() {
  return (
    <Prose>
      <Lead>
        &ldquo;Neural network&rdquo; sounds like brain surgery. The building block is so simple you could do it
        on paper: multiply a few numbers, add them up, and make one yes-or-no decision.
      </Lead>

      <P>
        A single <Strong>neuron</Strong> takes some input numbers and gives each one a{" "}
        <Term define="A number saying how much an input matters. Positive pulls one way, negative the other.">
          weight
        </Term>{" "}
        — a measure of how much that input matters. It multiplies each input by its weight, adds the results
        together, adds one more number called the <Strong>bias</Strong>, and passes the total through a final
        step that squashes it into a decision. Below, each dot has two inputs — its position{" "}
        <Code>x₁</Code> and <Code>x₂</Code> — and the neuron sorts the plane into two coloured regions.
      </P>

      <ArtifactFrame
        title="Neuron Playground"
        hint="Turn the three knobs"
        caption="Three numbers — two weights and a bias — completely define where the line falls and which way it tilts."
      >
        <NeuronPlayground />
      </ArtifactFrame>

      <Callout tone="try">
        <p>
          The teal and rose dots are two groups we want to separate. <Strong>Can you turn the three knobs until
          every dot is on the right side</Strong> — &ldquo;Dots classified right&rdquo; hits 100%? Notice the
          weights <Em>rotate</Em> the boundary while the bias <Em>slides</Em> it. Then drag the test ring across
          the line and watch the live equation compute its fate.
        </p>
      </Callout>

      <H2>Reading the machine</H2>
      <P>
        The equation in the panel is the entire neuron: <Code>z = w₁·x₁ + w₂·x₂ + b</Code>. The weights{" "}
        <Code>w₁</Code> and <Code>w₂</Code> decide the <Em>direction</Em> of the dividing line (the arrow points
        the way of &ldquo;more teal&rdquo;). The bias <Code>b</Code> shifts the line without rotating it — it&apos;s
        the neuron&apos;s eagerness to say yes. Everything you can see is controlled by just those three numbers.
      </P>

      <H2>The squash at the end</H2>
      <P>
        That last step — the <Strong>activation</Strong> — turns the raw total into an answer. The{" "}
        <Strong>Step</Strong> setting is blunt: above the line is a hard yes, below is a hard no. The{" "}
        <Term define="A smooth S-shaped curve that turns any number into a value between 0 and 1, read as a probability.">
          Sigmoid
        </Term>{" "}
        is gentler — it fades from no to yes, giving a confidence between 0 and 1. That smooth fade is what lets
        gradient descent from the last lesson feel its way downhill and actually <Em>train</Em> the weights.
      </P>

      <Callout tone="key">
        <p>
          A neuron is just <Strong>weighted sum → add bias → squash into a decision</Strong>. Those weights are
          exactly the knobs that training tunes. One neuron can only ever draw a single straight line — which is
          both its power and its hard limit.
        </p>
      </Callout>

      <Callout tone="recap">
        <p>
          One straight line can&apos;t separate a spiral, or tell a cat from a dog. But here&apos;s the trick
          that changed everything: feed the output of some neurons into <Em>more</Em> neurons, layer upon layer,
          and the flat lines start to bend and combine into almost any shape imaginable. Stacking these simple
          parts is what we&apos;ll do next.
        </p>
      </Callout>

      <AdvancedSection>
        <P>
          One neuron is small enough to hold completely in your head — which makes it the perfect place to see the
          full learning machinery with nothing hidden.
        </P>

        <AdvH>The math</AdvH>
        <P>In vector form, the neuron is a dot product, a shift, and a squash:</P>
        <MathBlock tex={String.raw`z = \mathbf{w}\cdot\mathbf{x} + b \qquad\quad \hat{y} = \sigma(z) = \frac{1}{1 + e^{-z}}`} />
        <P>
          The decision boundary you steered is exactly the set of points where the neuron is undecided,{" "}
          <MathInline tex={String.raw`\mathbf{w}\cdot\mathbf{x} + b = 0`} /> — always a straight line (in higher
          dimensions, a flat plane), perpendicular to <MathInline tex={String.raw`\mathbf{w}`} />. That&apos;s why
          the arrow in the artifact is always at right angles to the boundary.
        </P>
        <P>The sigmoid has a famously tidy derivative, which is half the reason it was the classic choice:</P>
        <MathBlock tex={String.raw`\sigma'(z) = \sigma(z)\,\bigl(1 - \sigma(z)\bigr)`} />
        <P>
          Train it with cross-entropy loss <MathInline tex={String.raw`\mathcal{L} = -\,y\log\hat{y} - (1-y)\log(1-\hat{y})`} />{" "}
          and the gradient collapses to the cleanest formula in machine learning — error times input:
        </P>
        <MathBlock tex={String.raw`\frac{\partial \mathcal{L}}{\partial w_i} = (\hat{y} - y)\,x_i \qquad \frac{\partial \mathcal{L}}{\partial b} = \hat{y} - y`} />
        <P>
          A single trained neuron is, in fact, a model statisticians have used for decades under another name:{" "}
          <Term define="A classic statistical model: linear weights through a sigmoid, trained on cross-entropy.">logistic regression</Term>.
        </P>

        <AdvH>The code</AdvH>
        <CodeBlock
          title="a neuron, learning"
          code={`def forward(w, b, x):
    z = dot(w, x) + b
    return 1 / (1 + exp(-z))        # sigmoid -> confidence in "yes"

def train_step(w, b, x, y, lr):
    y_hat = forward(w, b, x)
    error = y_hat - y               # the whole gradient story
    for i in range(len(w)):
        w[i] -= lr * error * x[i]   # blame ∝ error × input
    b -= lr * error
    return w, b`}
        />

        <AdvH>Watch the signal move</AdvH>
        <P>
          Here is a single neuron as a flow diagram — the same X-ray view the Neural Networks lesson uses for a full
          network. Click the output node to see its arithmetic; flip to <Strong>Backward</Strong> to see the blame
          signal <MathInline tex={String.raw`\delta = \hat{y} - y`} /> appear:
        </P>
        <NetworkFlow layers={[2, 1]} />
      </AdvancedSection>
    </Prose>
  );
}
