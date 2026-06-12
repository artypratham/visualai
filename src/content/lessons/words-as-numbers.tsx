import { Prose, Lead, P, H2, Strong, Em, Term, Code } from "@/components/lesson/prose";
import { AdvancedSection, AdvH } from "@/components/lesson/AdvancedSection";
import { MathBlock, MathInline } from "@/components/lesson/math";
import { CodeBlock } from "@/components/lesson/CodeBlock";
import { Callout } from "@/components/lesson/Callout";
import { ArtifactFrame } from "@/components/lesson/ArtifactFrame";
import { EmbeddingSpace } from "@/components/artifacts/EmbeddingSpace";

export function WordsAsNumbersContent() {
  return (
    <Prose>
      <Lead>
        A neural network only eats numbers — but a word isn&apos;t a number. The fix is one of the most beautiful
        ideas in AI: give every word a location in a map of meaning, and watch arithmetic start to make sense of
        language.
      </Lead>

      <P>
        The lazy approach would be to number the words: <Code>cat = 1</Code>, <Code>dog = 2</Code>,{" "}
        <Code>king = 3</Code>. But those numbers are meaningless — they say cat and dog are as different as 1 and
        2, and that king is somehow &ldquo;bigger&rdquo; than both. We need numbers that actually capture what a
        word <Em>means</Em>.
      </P>
      <P>
        So instead we give each word a whole <Strong>list</Strong> of numbers — coordinates that place it
        somewhere in a space of meaning. The trick is that these coordinates aren&apos;t assigned by hand;
        they&apos;re <Em>learned</Em>, by noticing which words show up in similar contexts. Words used the same
        way drift to the same neighbourhood. Explore the result:
      </P>

      <ArtifactFrame
        title="Embedding Space"
        hint="Hover words · drive the analogy machine"
        caption="A 2-D cartoon of a real embedding space. Nobody labelled these clusters — they emerge from how words are used."
      >
        <EmbeddingSpace />
      </ArtifactFrame>

      <Callout tone="try">
        <p>
          Hover <Strong>dog</Strong> — its nearest neighbours are <Em>puppy</Em> and <Em>cat</Em>, not{" "}
          <Em>pizza</Em>. The animals huddle together; the foods form their own island; countries and capitals
          line up in pairs. Then run the analogy machine: <Strong>king − man + woman</Strong>. The arrow lands
          right on <Strong>queen</Strong>. Try <Strong>paris − france + italy</Strong> too.
        </p>
      </Callout>

      <H2>Meaning becomes geometry</H2>
      <P>
        Each word&apos;s list of numbers is called its{" "}
        <Term define="A word's coordinates in a learned space of meaning — a list of numbers that captures how it's used.">
          embedding
        </Term>{" "}
        (a fancy word for &ldquo;the point where we embedded this word in space&rdquo;). Two ideas fall out of it,
        and they&apos;re the whole payoff:
      </P>
      <P>
        <Strong>Closeness = similarity.</Strong> Words near each other mean similar things. The model can measure
        &ldquo;how related are these two words?&rdquo; by literally measuring the distance between their points.
      </P>
      <P>
        <Strong>Directions = relationships.</Strong> The arrow from <Em>man</Em> to <Em>woman</Em> points the
        same way as the arrow from <Em>king</Em> to <Em>queen</Em> — that shared direction <Em>is</Em> the
        concept of gender. The arrow from a country to its capital is another consistent direction. Because
        relationships are directions, you can do arithmetic with meaning.
      </P>

      <Callout tone="key">
        <p>
          An embedding turns each word into a point in a space of meaning. Similar words sit close together, and
          the <Em>directions</Em> between words carry real concepts — so <Code>king − man + woman</Code> genuinely
          lands near <Code>queen</Code>. Language becomes geometry.
        </p>
      </Callout>

      <P>
        Two honest caveats. Our map is 2-D so you can see it; a real embedding space has <Em>hundreds</Em> of
        dimensions, with room for thousands of independent &ldquo;directions&rdquo; like tense, formality, or
        sentiment. And the coordinates are learned from oceans of text by a network trying to predict
        surrounding words — which is a sneak preview of how language models train.
      </P>

      <Callout tone="recap">
        <p>
          Words are finally numbers a network can chew on. But a sentence is a <Em>sequence</Em>, and meaning
          depends on context — &ldquo;river bank&rdquo; and &ldquo;money bank&rdquo; share a word but not a
          meaning. How does a model let each word check the others to figure out what&apos;s going on? That
          mechanism is <Strong>attention</Strong> — and it&apos;s next.
        </p>
      </Callout>

      <AdvancedSection>
        <P>
          Two things make the word map precise: the right way to measure &ldquo;close,&rdquo; and the training trick
          that places the points without any human drawing the map.
        </P>

        <AdvH>The math — similarity</AdvH>
        <P>
          In high dimensions, raw distance misleads (frequent words grow longer vectors), so embeddings are compared
          by the <Em>angle</Em> between them — <Term define="The cosine of the angle between two vectors: 1 = same direction, 0 = unrelated, −1 = opposite.">cosine similarity</Term>:
        </P>
        <MathBlock tex={String.raw`\cos(\mathbf{u}, \mathbf{v}) = \frac{\mathbf{u} \cdot \mathbf{v}}{\lVert\mathbf{u}\rVert \, \lVert\mathbf{v}\rVert}`} />
        <P>The analogy machine you drove is one line of vector arithmetic followed by a nearest-neighbour search:</P>
        <MathBlock tex={String.raw`\text{queen} \approx \operatorname*{arg\,max}_{w \in V} \; \cos\bigl(\mathbf{v}_w,\; \mathbf{v}_{\text{king}} - \mathbf{v}_{\text{man}} + \mathbf{v}_{\text{woman}}\bigr)`} />

        <AdvH>The math — where the coordinates come from</AdvH>
        <P>
          The classic recipe (word2vec&apos;s <Em>skip-gram</Em>) trains each word&apos;s vector to predict the words
          around it. Over a huge corpus, maximise:
        </P>
        <MathBlock tex={String.raw`\sum_{t} \;\sum_{-c \,\le\, j \,\le\, c,\; j \neq 0} \log P\bigl(w_{t+j} \mid w_t\bigr), \qquad P(o \mid w) = \frac{e^{\mathbf{v}_o \cdot \mathbf{v}_w}}{\sum_{u \in V} e^{\mathbf{v}_u \cdot \mathbf{v}_w}}`} />
        <P>
          No labels, no dictionary — just &ldquo;words seen together get pulled together&rdquo; (the softmax pushes
          everything else apart). Gender-as-a-direction is never programmed; it <Em>emerges</Em> because man/woman,
          king/queen, uncle/aunt all co-occur with systematically different context words. That training is gradient
          descent again — the only learning rule this course ever needs.
        </P>

        <AdvH>The code</AdvH>
        <CodeBlock
          title="similarity + analogy (the artifact's logic, real-scale)"
          code={`def most_similar(target_vec, embeddings, exclude, k=5):
    scores = []
    for word, vec in embeddings.items():
        if word not in exclude:
            scores.append((cosine(vec, target_vec), word))
    return sorted(scores, reverse=True)[:k]

def analogy(a, b, c, E):               # a is to b as c is to ?
    target = E[b] - E[a] + E[c]
    return most_similar(target, E, exclude={a, b, c})`}
        />
        <P>
          Modern LLMs keep the idea but lose the fixed map: a transformer&apos;s embeddings are <Em>contextual</Em>,
          re-computed per sentence — so &ldquo;bank&rdquo; lands in different places in &ldquo;river bank&rdquo; and
          &ldquo;bank loan.&rdquo; The mechanism that moves it is exactly the attention of the next lesson.
        </P>
      </AdvancedSection>
    </Prose>
  );
}
