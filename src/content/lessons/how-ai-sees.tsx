import { Prose, Lead, P, H2, Strong, Em, Term, Code } from "@/components/lesson/prose";
import { AdvancedSection, AdvH } from "@/components/lesson/AdvancedSection";
import { MathBlock, MathInline } from "@/components/lesson/math";
import { CodeBlock } from "@/components/lesson/CodeBlock";
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

      <AdvancedSection>
        <P>
          The slide-multiply-sum you watched has a one-line definition, a shape calculus every vision engineer
          memorises, and a four-line implementation.
        </P>

        <AdvH>The math</AdvH>
        <P>
          A (discrete, 2-D) <Term define="Slide a small kernel over an image; at each position, multiply element-wise and sum.">convolution</Term>{" "}
          of image <MathInline tex={String.raw`I`} /> with a <MathInline tex={String.raw`k \times k`} /> kernel{" "}
          <MathInline tex={String.raw`K`} />:
        </P>
        <MathBlock tex={String.raw`(I * K)(x, y) = \sum_{i=1}^{k}\sum_{j=1}^{k} I(x{+}i,\, y{+}j)\; K(i, j)`} />
        <P>
          With padding <MathInline tex={String.raw`p`} /> and stride <MathInline tex={String.raw`s`} />, an{" "}
          <MathInline tex={String.raw`n \times n`} /> input produces an output of size:
        </P>
        <MathBlock tex={String.raw`n_{\text{out}} = \left\lfloor \frac{n + 2p - k}{s} \right\rfloor + 1`} />
        <P>
          Why this beats the flatten-everything approach from Lesson 2 — two structural superpowers:{" "}
          <Strong>weight sharing</Strong> (one 3×3 kernel = 9 parameters scanned everywhere, versus millions for a
          dense layer over a photo) and <Strong>translation equivariance</Strong> (a cat detector works wherever the
          cat sits, for free). And crucially, the kernel entries are just weights — the same{" "}
          <MathInline tex={String.raw`\partial \mathcal{L} / \partial K_{ij}`} /> gradient-descent story as every
          other lesson, so the network <Em>learns</Em> its own edge detectors.
        </P>

        <AdvH>The code</AdvH>
        <CodeBlock
          title="conv2d (the Kernel Explorer's exact loop)"
          code={`def conv2d(image, kernel):
    out = zeros(H, W)
    for y in range(H):
        for x in range(W):
            total = 0
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    total += image[y+dy][x+dx] * kernel[dy+1][dx+1]
            out[y][x] = total
    return out
# a CNN layer: many kernels -> many output "feature maps",
# then a nonlinearity, then convolve those maps again, deeper and deeper`}
        />
        <P>
          Stack the layers and the receptive field grows: layer 1 sees 3×3 pixels, layer 2 effectively 5×5, and ten
          layers deep a single unit summarises a whole region — edges → textures → parts → objects. The grand modern
          twist: Vision Transformers skip convolution entirely, chop the image into 16×16 patch &ldquo;tokens,&rdquo;
          and run the attention from Chapter 3 on them. Both architectures win benchmarks; the inductive bias of
          convolution just gets you there with less data.
        </P>
      </AdvancedSection>
    </Prose>
  );
}
