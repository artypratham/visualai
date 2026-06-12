import { Prose, Lead, P, H2, Strong, Em, Term, Code } from "@/components/lesson/prose";
import { AdvancedSection, AdvH } from "@/components/lesson/AdvancedSection";
import { MathBlock, MathInline } from "@/components/lesson/math";
import { CodeBlock } from "@/components/lesson/CodeBlock";
import { Callout } from "@/components/lesson/Callout";
import { ArtifactFrame } from "@/components/lesson/ArtifactFrame";
import { KMeansLive } from "@/components/artifacts/KMeansLive";

export function LearningWithoutLabelsContent() {
  return (
    <Prose>
      <Lead>
        Every lesson so far has handed the machine the answers — &ldquo;this is a cat, that isn&apos;t.&rdquo; But
        often nobody knows the answers. Sometimes you just have a pile of data and a hunch that there&apos;s
        structure hiding in it.
      </Lead>

      <P>
        Think of a shop with thousands of customers and no idea how to group them, or a telescope with a million
        unlabelled galaxies. There are no labels to learn from. The task isn&apos;t to predict a known answer —
        it&apos;s to <Em>discover the groups that were there all along</Em>. This is{" "}
        <Term define="Finding structure in data that has no labels — the machine isn't told the right answers.">unsupervised learning</Term>.
      </P>
      <P>
        The dots below have no colours, no categories, nothing. Watch a classic method called <Strong>k-means</Strong>{" "}
        find the clusters with an almost suspiciously simple loop.
      </P>

      <ArtifactFrame
        title="k-Means Live"
        hint="Press Step a few times, then Auto-run"
        caption="Two steps, repeated: paint each point by its nearest centre, then slide each centre to the middle of its colour."
      >
        <KMeansLive />
      </ArtifactFrame>

      <Callout tone="try">
        <p>
          Tap <Strong>Step</Strong> and watch the centres lurch toward the crowds, the colours snapping into place
          until everything stops moving. With <Strong>k = 4</Strong> it cleanly recovers the four blobs. Try{" "}
          <Strong>k = 2</Strong> (it merges them) or <Strong>k = 5</Strong> (it splits one). Hit <Strong>Re-seed</Strong>{" "}
          a few times — occasionally it settles into a worse grouping. That&apos;s not a bug.
        </p>
      </Callout>

      <H2>How it finds groups with no teacher</H2>
      <P>
        k-means just alternates two moves: <Strong>assign</Strong> every point to its nearest{" "}
        <Term define="The current centre of a cluster — the average position of all points assigned to it.">centroid</Term>,
        then <Strong>update</Strong> each centroid to the average of its assigned points. Repeat until nothing
        moves. It&apos;s guaranteed to settle — but, like the loss valleys from gradient descent, it can settle
        into a <Em>local</Em> best that depends on where the centres started. That&apos;s why re-seeding sometimes
        gives a worse answer.
      </P>

      <Callout tone="key">
        <p>
          Not all learning needs labelled answers. Given only raw data, algorithms can surface groups, outliers,
          and structure entirely on their own. This powers customer segmentation, fraud and anomaly detection, and
          — crucially — the &ldquo;self-supervised&rdquo; pre-training that lets language models learn from oceans
          of unlabelled text by quizzing themselves on the next token.
        </p>
      </Callout>

      <P>
        That self-supervised trick is the secret link back to LLMs: the data labels <Em>itself</Em>. Hide the next
        word and the text becomes its own answer key — no human annotators required, which is the only reason
        training on the whole internet is even possible.
      </P>

      <Callout tone="recap">
        <p>
          So we&apos;ve seen learning <Em>with</Em> labels and learning with <Em>no</Em> labels. There&apos;s one
          more flavour, and it&apos;s how AI masters games and controls robots: learning from nothing but{" "}
          <Strong>reward</Strong> — trial, error, and the occasional treat. That&apos;s next.
        </p>
      </Callout>

      <AdvancedSection>
        <P>
          The two-step dance you watched is secretly an optimiser — it just never computes a gradient. Here&apos;s
          what it minimises and why it can&apos;t loop forever.
        </P>

        <AdvH>The math</AdvH>
        <P>
          k-means minimises the total squared distance from each point to its cluster&apos;s centre (&ldquo;inertia&rdquo;):
        </P>
        <MathBlock tex={String.raw`J = \sum_{k=1}^{K} \;\sum_{\mathbf{x} \in C_k} \bigl\lVert \mathbf{x} - \boldsymbol{\mu}_k \bigr\rVert^2`} />
        <P>
          Each of Lloyd&apos;s two steps can only lower <MathInline tex={String.raw`J`} />: the{" "}
          <Strong>assign</Strong> step gives every point its nearest centre (best possible assignment for the current
          centres), and the <Strong>update</Strong> step moves each centre to its cluster&apos;s mean — which is
          precisely the point minimising summed squared distance:
        </P>
        <MathBlock tex={String.raw`\boldsymbol{\mu}_k = \frac{1}{|C_k|} \sum_{\mathbf{x} \in C_k} \mathbf{x}`} />
        <P>
          <MathInline tex={String.raw`J`} /> falls monotonically and there are finitely many assignments, so the
          loop must stop. But — like the loss valleys of Lesson 3 — it stops at a <Em>local</Em> minimum that depends
          on where the centres started. That&apos;s exactly what you saw when re-seeding occasionally produced a
          worse grouping. The standard fixes: <Strong>k-means++</Strong> (seed new centres far from existing ones,
          proportional to squared distance) and simply running it several times, keeping the lowest{" "}
          <MathInline tex={String.raw`J`} />.
        </P>

        <AdvH>The code</AdvH>
        <CodeBlock
          title="Lloyd's algorithm (the artifact's exact loop)"
          code={`def kmeans(points, k):
    centers = kmeans_pp_init(points, k)      # smart seeding
    while True:
        # assign: paint each point with its nearest centre
        clusters = group_by(points,
                            key=lambda p: argmin(dist(p, c) for c in centers))
        # update: slide each centre to the middle of its colour
        new_centers = [mean(cluster) for cluster in clusters]
        if new_centers == centers:           # nothing moved -> settled
            return clusters
        centers = new_centers`}
        />
        <P>
          Picking <MathInline tex={String.raw`K`} /> is the genuinely unsolved-feeling part — <MathInline tex={String.raw`J`} />{" "}
          always falls as <MathInline tex={String.raw`K`} /> grows (more centres can only help), so you look for the
          &ldquo;elbow&rdquo; where improvement suddenly slows, or use silhouette scores. And the modern echo: the
          self-supervised pretraining of Chapter 6 is this same spirit — no labels, structure discovered from the
          data itself — scaled from 120 dots to the entire internet.
        </P>
      </AdvancedSection>
    </Prose>
  );
}
