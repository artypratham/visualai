import { Prose, Lead, P, H2, Strong, Em, Term } from "@/components/lesson/prose";
import { Callout } from "@/components/lesson/Callout";
import { ArtifactFrame } from "@/components/lesson/ArtifactFrame";
import { KernelExplorer } from "@/components/artifacts/KernelExplorer";

export function HowAiSeesContent() {
  return (
    <Prose>
      <Lead>
        Everything so far has been about text. But the same machine that writes essays can also recognise a face
        — and it all starts with one humble trick: a tiny window sliding across an image, hunting for edges.
      </Lead>

      <P>
        Remember that an image is just a grid of brightness numbers. How does a network get from that grid to
        &ldquo;there&apos;s a cat&rdquo;? It doesn&apos;t look at the whole picture at once. It starts small —
        scanning for the simplest possible features, like edges and corners — using a little grid of numbers
        called a <Strong>kernel</Strong> (or filter).
      </P>
      <P>
        Here&apos;s the move: slide that 3×3 kernel over every spot in the image. At each spot, multiply the nine
        pixels underneath by the nine kernel numbers, add them up, and that sum becomes one pixel of a brand-new
        image. Different kernels reveal different things. Play:
      </P>

      <ArtifactFrame
        title="Kernel Explorer"
        hint="Try the presets, then edit the kernel numbers yourself"
        caption="One little grid of numbers, slid across the image, is the atom of all computer vision."
      >
        <KernelExplorer />
      </ArtifactFrame>

      <Callout tone="try">
        <p>
          Hit <Strong>Edge detect</Strong> — the shapes&apos; outlines suddenly glow while the flat areas go dark.
          That&apos;s the kernel responding only where brightness <Em>changes</Em>. Try <Strong>Blur</Strong>,{" "}
          <Strong>Sharpen</Strong>, <Strong>Emboss</Strong>. Then go off-script: <Strong>edit the nine numbers</Strong>{" "}
          and invent a filter no one named.
        </p>
      </Callout>

      <H2>This operation has a name</H2>
      <P>
        Sliding a kernel across an image and summing is called a{" "}
        <Term define="Sliding a small grid of weights across an image, multiplying and summing at each position.">convolution</Term>.
        A network layer that does this is a <Em>convolutional layer</Em>, and a network built from them is a{" "}
        <Term define="Convolutional Neural Network — the architecture behind most image recognition.">CNN</Term> —
        the workhorse behind photo tagging, medical imaging, and self-driving cars. The twist: the network
        doesn&apos;t use kernels we picked. It <Strong>learns the kernel numbers itself</Strong>, the same way it
        learned weights — by gradient descent.
      </P>

      <Callout tone="key">
        <p>
          Vision begins with tiny local filters that detect simple patterns. Stack layers of them and the early
          edges combine into textures, then shapes, then whole objects — a learned hierarchy from &ldquo;there&apos;s
          an edge here&rdquo; up to &ldquo;that&apos;s a cat.&rdquo; Nobody programs the cat-detector; it emerges.
        </p>
      </Callout>

      <P>
        A real network learns hundreds of these filters per layer. Peek inside one and the first layer is full of
        edge- and colour-detectors; deeper layers respond to eyes, wheels, fur, faces — increasingly abstract,
        built entirely out of those first humble edges.
      </P>

      <Callout tone="recap">
        <p>
          That&apos;s how AI <Em>sees</Em>. The natural next question is how it <Strong>paints</Strong> — how
          tools like Midjourney conjure a brand-new image out of nothing. The answer is gloriously strange: they
          start from pure noise and remove it, step by step. That&apos;s next.
        </p>
      </Callout>
    </Prose>
  );
}
