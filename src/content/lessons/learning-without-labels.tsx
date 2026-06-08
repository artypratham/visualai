import { Prose, Lead, P, H2, Strong, Em, Term } from "@/components/lesson/prose";
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
    </Prose>
  );
}
