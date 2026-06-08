import { Prose, Lead, P, H2, Strong, Em, Term, Code } from "@/components/lesson/prose";
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
    </Prose>
  );
}
