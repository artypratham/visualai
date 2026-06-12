import { Prose, Lead, P, H2, Strong, Em, Term, Code } from "@/components/lesson/prose";
import { AdvancedSection, AdvH } from "@/components/lesson/AdvancedSection";
import { MathBlock, MathInline } from "@/components/lesson/math";
import { CodeBlock } from "@/components/lesson/CodeBlock";
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

      <AdvancedSection>
        <P>
          A scaling law is one short formula — but it&apos;s the formula that decides hundred-million-dollar
          training runs.
        </P>

        <AdvH>The math</AdvH>
        <P>
          Loss falls as a <Strong>power law</Strong> of model size <MathInline tex={String.raw`N`} /> (and likewise
          of data <MathInline tex={String.raw`D`} /> and compute <MathInline tex={String.raw`C`} />), floored by an
          irreducible term:
        </P>
        <MathBlock tex={String.raw`L(N) = L_{\infty} + \frac{a}{N^{\alpha}}`} />
        <P>
          <MathInline tex={String.raw`L_{\infty}`} /> is the entropy of language itself — the part of the next word
          that is genuinely unpredictable, which no amount of scale removes. Take logs of the falling part and the
          law turns into a straight line, which is exactly the log–log view in the dashboard:
        </P>
        <MathBlock tex={String.raw`\log\bigl(L - L_{\infty}\bigr) = \log a - \alpha\,\log N`} />
        <P>
          Straight lines extrapolate — that&apos;s the business model. Fit the line on cheap small runs, read off
          the loss of a 100× bigger run, decide whether it&apos;s worth the money <Em>before</Em> spending it.
          Measured exponents <MathInline tex={String.raw`\alpha`} /> are small (~0.05–0.1 for LLMs): each halving of
          the gap costs roughly an order of magnitude of scale. Improvement is reliable but brutally expensive —
          both facts at once.
        </P>
        <P>
          <Strong>Chinchilla&apos;s balance:</Strong> for a fixed compute budget{" "}
          <MathInline tex={String.raw`C \approx 6\,N\,D`} />, minimising{" "}
          <MathInline tex={String.raw`L(N, D)`} /> lands at <MathInline tex={String.raw`D^{*} \approx 20\,N`} /> —
          about twenty training tokens per parameter. GPT-3 was trained far off this optimum (175B parameters, only
          300B tokens); Chinchilla matched it with a model a quarter the size simply by feeding it more data. That
          one ratio is why the artifact&apos;s loss only dives when you move the sliders <Em>together</Em>.
        </P>

        <AdvH>The code</AdvH>
        <CodeBlock
          title="how labs actually use this"
          code={`# fit the law on small, cheap runs
runs = [(1e7, 4.1), (1e8, 3.4), (1e9, 2.9)]      # (size, measured loss)
alpha, log_a = linear_fit(
    x=[log(N) for N, L in runs],
    y=[log(L - L_inf) for N, L in runs])

def predict_loss(N):                      # extrapolate before you spend
    return L_inf + exp(log_a) * N**(-alpha)

# chinchilla-optimal allocation of a budget C ≈ 6·N·D
N_opt = solve_for_balance(C)              # ~sqrt-ish split
D_opt = 20 * N_opt                        # ≈ 20 tokens per parameter`}
        />
        <P>
          One caveat the field still argues about: emergence. Average loss follows the law beautifully, but
          task-level abilities can jump — though some &ldquo;jumps&rdquo; turn out to be artifacts of all-or-nothing
          metrics (grade arithmetic by exact answer and partial skill scores zero until it suddenly doesn&apos;t).
          Smooth competence, cliff-shaped scoreboards. The honest summary: the loss curve is predictable; what a
          given loss <Em>buys you</Em> still surprises everyone.
        </P>
      </AdvancedSection>
    </Prose>
  );
}
