import { Prose, Lead, P, H2, Strong, Em, Term, Code } from "@/components/lesson/prose";
import { AdvancedSection, AdvH } from "@/components/lesson/AdvancedSection";
import { MathBlock, MathInline } from "@/components/lesson/math";
import { CodeBlock } from "@/components/lesson/CodeBlock";
import { Callout } from "@/components/lesson/Callout";
import { ArtifactFrame } from "@/components/lesson/ArtifactFrame";
import { DiffusionDenoiser } from "@/components/artifacts/DiffusionDenoiser";

export function MakingImagesContent() {
  return (
    <Prose>
      <Lead>
        You&apos;ve seen how AI reads an image. Now the magic trick in reverse: how it <Em>makes</Em> one. Tools
        like Midjourney and DALL·E begin with pure television static and patiently carve a picture out of it.
      </Lead>

      <P>
        It sounds backwards, and it is. The key insight behind <Strong>diffusion</Strong> models is this: nobody
        knows how to paint a cat from scratch, but it&apos;s easy to <Em>destroy</Em> a photo of a cat — just keep
        sprinkling random noise on it until it&apos;s indistinguishable from static. And if you can teach a model
        to undo a single step of that destruction, you can run it in reverse, from noise all the way back to a
        picture. Try the reverse journey yourself:
      </P>

      <ArtifactFrame
        title="Diffusion Denoiser"
        hint="Drag from noise to image, or press Animate"
        caption="Pure random static on the left of the slider; a finished image on the right. Generation is everything in between."
      >
        <DiffusionDenoiser />
      </ArtifactFrame>

      <Callout tone="try">
        <p>
          Pick a target, then drag the slider from <Strong>0% (pure noise)</Strong> toward{" "}
          <Strong>100% (clean image)</Strong> — or hit <Strong>Animate denoising</Strong> and watch the picture
          crystallise out of the static. Now press <Strong>New noise</Strong> and animate again: a totally
          different starting chaos, the same picture. It&apos;s constructing the image, not recalling a saved copy.
        </p>
      </Callout>

      <H2>From static to art, one step at a time</H2>
      <P>
        Training works in two directions. The <Em>forward</Em> process takes real images and adds noise step by
        step until they&apos;re static — that part is just maths, no learning needed. The model is trained on the{" "}
        <Em>reverse</Em>: at each noisy step, predict the noise to subtract. To{" "}
        <Term define="A model that generates images by starting from random noise and removing it step by step.">
          generate
        </Term>{" "}
        a brand-new image, you hand it fresh random noise and let it denoise, again and again, until something
        coherent emerges.
      </P>

      <Callout tone="key">
        <p>
          Image generation is learning to <Strong>remove noise</Strong>. Start from randomness and denoise, step by
          step, and a novel image appears — assembled, not copied. Because it begins from random static every time,
          the same request can produce endless different results.
        </p>
      </Callout>

      <P>
        One honest gap: our toy simply fades to a fixed picture. A real diffusion model <Em>predicts</Em> the noise
        to remove, and — crucially — its denoising is <Strong>steered by your text prompt</Strong>. &ldquo;A red
        fox in the snow&rdquo; gently biases every step toward fox-ness and snow-ness. The intuition, though, is
        exactly what you just felt: noise in, image out, one nudge at a time.
      </P>

      <Callout tone="recap">
        <p>
          You&apos;ve now seen AI learn, fail, see, and paint. Time to go behind the curtain of the system that
          started it all. The next chapter rebuilds ChatGPT from scratch — beginning with how it chops up your
          words into <Strong>tokens</Strong>.
        </p>
      </Callout>

      <AdvancedSection>
        <P>
          Diffusion has unusually clean math for something that feels like sorcery. Two equations carry the whole
          idea.
        </P>

        <AdvH>The math — destroying (no learning needed)</AdvH>
        <P>
          The <Em>forward</Em> process mixes an image <MathInline tex={String.raw`x_0`} /> with Gaussian noise{" "}
          <MathInline tex={String.raw`\varepsilon \sim \mathcal{N}(0, I)`} />. Thanks to a closed form, you can jump
          straight to any noise level <MathInline tex={String.raw`t`} />:
        </P>
        <MathBlock tex={String.raw`x_t = \sqrt{\bar{\alpha}_t}\; x_0 \;+\; \sqrt{1 - \bar{\alpha}_t}\;\varepsilon`} />
        <P>
          where <MathInline tex={String.raw`\bar{\alpha}_t`} /> slides from 1 (clean) to 0 (pure static) on a fixed
          schedule. Honest disclosure: this equation is <Em>exactly</Em> what the slider above implements — your
          drag sets <MathInline tex={String.raw`\bar{\alpha}_t`} />. What the toy fakes is the hard direction.
        </P>

        <AdvH>The math — learning to undo it</AdvH>
        <P>
          The model <MathInline tex={String.raw`\varepsilon_{\theta}`} /> (a big U-shaped CNN — the convolutions from
          two lessons ago) is trained on one disarmingly simple objective: look at a noised image and{" "}
          <Strong>predict the noise that was added</Strong>:
        </P>
        <MathBlock tex={String.raw`\mathcal{L} = \mathbb{E}_{x_0,\, \varepsilon,\, t}\; \bigl\lVert\, \varepsilon - \varepsilon_{\theta}(x_t,\, t) \,\bigr\rVert^2`} />
        <P>
          That&apos;s a plain regression loss — Lesson 3&apos;s MSE, wearing a trench coat. Generation then runs the
          schedule backwards: start from pure noise, repeatedly subtract a fraction of the predicted noise (plus a
          dash of fresh randomness to keep samples diverse).
        </P>

        <AdvH>The code</AdvH>
        <CodeBlock
          title="DDPM in miniature"
          code={`def train_step(x0):
    t   = random_timestep()
    eps = gaussian_noise()
    x_t = sqrt(abar[t]) * x0 + sqrt(1 - abar[t]) * eps
    loss = mse(model(x_t, t), eps)      # "which part is noise?"
    descend(loss)                       # gradient descent, as always

def sample():
    x = gaussian_noise()                # pure static
    for t in reversed(range(T)):        # e.g. T = 50 steps
        eps_hat = model(x, t)
        x = step_toward_clean(x, eps_hat, t)  # remove a sliver of noise
        if t > 0:
            x += sigma[t] * gaussian_noise()  # keep it stochastic
    return x`}
        />
        <P>
          The text prompt enters as <Em>conditioning</Em>: <MathInline tex={String.raw`\varepsilon_{\theta}(x_t, t, c)`} />{" "}
          also receives an embedding of your words (cross-attention — Chapter 3 again), so every denoising step leans
          toward images whose captions matched the prompt. Tools like Stable Diffusion run this in a compressed
          latent space rather than raw pixels, which is why they&apos;re fast enough to be products.
        </P>
      </AdvancedSection>
    </Prose>
  );
}
