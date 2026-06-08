import { Prose, Lead, P, H2, Strong, Em, Term } from "@/components/lesson/prose";
import { Callout } from "@/components/lesson/Callout";
import { ArtifactFrame } from "@/components/lesson/ArtifactFrame";
import { ScalingLaws } from "@/components/artifacts/ScalingLaws";

export function ScalingLawsContent() {
  return (
    <Prose>
      <Lead>
        The engine behind the whole AI boom is an almost embarrassingly blunt idea: make it bigger, and it gets
        better — <Em>predictably</Em> better. Predictable enough to bet a billion dollars on.
      </Lead>

      <P>
        Give a model more <Strong>data</Strong>, more <Strong>parameters</Strong>, and more <Strong>compute</Strong>,
        and its error falls along a smooth, almost boringly reliable curve. There&apos;s no magic threshold where
        understanding switches on — just a steady downhill slope. Push the sliders and watch the loss drop:
      </P>

      <ArtifactFrame
        title="Scaling Dashboard"
        hint="Move all three · toggle log–log"
        caption="Loss falls as a power law of scale. Flip to log–log and the curve becomes a dead-straight line — that line is the 'scaling law'."
      >
        <ScalingLaws />
      </ArtifactFrame>

      <Callout tone="try">
        <p>
          First raise <Strong>only one</Strong> slider — notice the loss barely budges. Now raise all three together
          and watch it dive. Flip to <Strong>log–log</Strong> to see the eerie straight line. And keep pushing past
          1,000× until the locked skill suddenly <Em>switches on</Em>.
        </p>
      </Callout>

      <H2>Bigger, but in balance</H2>
      <P>
        That &ldquo;one slider barely helps&rdquo; effect is real. A giant model starved of data, or a mountain of
        data fed to a tiny model, both stall — the <Strong>weakest ingredient</Strong> caps the result. The famous{" "}
        <Term define="Chinchilla (2022): a study showing that for a fixed compute budget, model size and training data should grow together in proportion — many large models had been badly under-trained on data.">
          Chinchilla
        </Term>{" "}
        finding was exactly this: model size and data have to grow <Em>together</Em>, or you&apos;re wasting the
        compute.
      </P>

      <Callout tone="key">
        <p>
          A <Strong>scaling law</Strong> says loss is a predictable power law of scale. That predictability is the
          quiet superpower: labs can forecast how good a model will be <Em>before</Em> spending months training it —
          which is how anyone justifies the cost of the next, bigger run.
        </p>
      </Callout>

      <P>
        The strangest twist is the locked skill you unlocked. While average loss glides down smoothly, specific
        abilities — arithmetic, translation, writing code — can stay near-useless and then appear almost{" "}
        <Em>suddenly</Em> once the model is big enough. These{" "}
        <Term define="Emergent abilities: capabilities that are absent in smaller models and appear fairly abruptly at larger scale, not obviously predictable from the smooth loss curve.">
          emergent abilities
        </Term>{" "}
        are part of why bigger models keep surprising even the people who build them.
      </P>

      <Callout tone="recap">
        <p>
          And that closes the loop. <Strong>Scale</Strong> built a base model that knows the world; <Strong>fine-tuning</Strong>{" "}
          gave it a job; <Strong>RLHF</Strong> gave it manners. Tokens in, an assistant out — that&apos;s how ChatGPT
          was made. Next we&apos;ll step outside the language-model story entirely and meet the other great ways a
          machine can learn.
        </p>
      </Callout>
    </Prose>
  );
}
