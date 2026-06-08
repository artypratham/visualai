import { Prose, Lead, P, H2, Strong, Em, Term } from "@/components/lesson/prose";
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
    </Prose>
  );
}
