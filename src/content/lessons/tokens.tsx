import { Prose, Lead, P, H2, Strong, Em, Term, Code } from "@/components/lesson/prose";
import { AdvancedSection, AdvH } from "@/components/lesson/AdvancedSection";
import { MathBlock, MathInline } from "@/components/lesson/math";
import { CodeBlock } from "@/components/lesson/CodeBlock";
import { Callout } from "@/components/lesson/Callout";
import { ArtifactFrame } from "@/components/lesson/ArtifactFrame";
import { TokenizerPlayground } from "@/components/artifacts/TokenizerPlayground";

export function TokensContent() {
  return (
    <Prose>
      <Lead>
        We&apos;ve said a model &ldquo;predicts the next word.&rdquo; That was a white lie. It predicts the next{" "}
        <Em>token</Em> — and that small distinction explains some of AI&apos;s strangest quirks.
      </Lead>

      <P>
        Before a model can turn words into the vectors from earlier, it has to chop your text into units. It
        doesn&apos;t split on spaces, and it doesn&apos;t go letter by letter. It uses a fixed dictionary of{" "}
        <Strong>tokens</Strong>: common words are usually a single token, while rarer words get broken into
        familiar pieces. Type something and watch the chopping happen:
      </P>

      <ArtifactFrame
        title="Tokenizer Playground"
        hint="Type, or try the chips below"
        caption="The coloured chunks are exactly what the model receives. A leading space (·) is part of the token."
      >
        <TokenizerPlayground />
      </ArtifactFrame>

      <Callout tone="try">
        <p>
          Start with <Strong>strawberry</Strong> — it splits into <Code>straw</Code> + <Code>berry</Code>. A
          plain sentence is mostly one-token words. <Strong>tokenization</Strong> becomes <Code>token</Code> +{" "}
          <Code>ization</Code>. And the <Strong>emoji</Strong> alone eats several tokens. Keep an eye on the token
          count versus the character count.
        </p>
      </Callout>

      <H2>Why chop it up this way?</H2>
      <P>
        The dictionary is built by a method called{" "}
        <Term define="Byte-Pair Encoding: repeatedly merge the most common pair of characters in a huge text corpus to build a vocabulary of tokens.">
          byte-pair encoding
        </Term>
        : start from single characters and keep merging the most common pairs across a giant pile of text. Frequent
        words end up as one token; anything unusual falls back to known fragments, and worst case, to single
        letters. It&apos;s a clever balance between &ldquo;a token for every word&rdquo; (too many) and &ldquo;a
        token for every letter&rdquo; (too slow).
      </P>

      <Callout tone="key">
        <p>
          A language model&apos;s entire world is a stream of tokens drawn from a fixed vocabulary (often ~100,000
          of them). It predicts the next <Em>token</Em>, never the next letter — which is exactly why
          letter-level tasks like &ldquo;count the R&apos;s in strawberry&rdquo; or rhyming or reversing a word
          are weirdly hard for it. It literally can&apos;t see the letters inside a token.
        </p>
      </Callout>

      <P>
        Tokens are also the unit of <Strong>money and memory</Strong>. APIs bill per token, not per word, and a
        model&apos;s &ldquo;context window&rdquo; (coming up later) is measured in tokens. Languages that the
        tokenizer wasn&apos;t optimised for can cost two or three times as many tokens for the same sentence — a
        quiet, real-world unfairness baked into the dictionary.
      </P>

      <Callout tone="recap">
        <p>
          Tokens are the raw material an LLM is made of. But a model that merely predicts the next token is just a
          rambler — it&apos;ll happily continue your text without ever <Em>answering</Em> you. So how did that raw
          predictor become a helpful, polite assistant? That transformation is the rest of this chapter.
        </p>
      </Callout>

      <AdvancedSection>
        <P>
          Byte-pair encoding is one of the rare algorithms in modern AI with <Em>no</Em> gradient descent in it —
          it&apos;s pure counting, and you can hold all of it in your head.
        </P>

        <AdvH>The algorithm</AdvH>
        <P>
          Start with a vocabulary of single bytes. Then, over a huge corpus, repeat one move: find the{" "}
          <Strong>most frequent adjacent pair</Strong> of tokens and merge it into a new token. Stop when the
          vocabulary hits the budget (GPT-style models: ~50,000–100,000 entries):
        </P>
        <CodeBlock
          title="training a BPE tokenizer"
          code={`def train_bpe(corpus, vocab_size):
    vocab  = all_single_bytes()              # 256 starters
    merges = []
    while len(vocab) < vocab_size:
        pairs = count_adjacent_pairs(corpus) # ("t","h") -> 9.1M, ...
        best  = argmax(pairs)
        merges.append(best)
        corpus = merge_everywhere(corpus, best)   # "t","h" -> "th"
        vocab.add(join(best))
    return vocab, merges

def tokenize(text, merges):                  # at run time
    tokens = list(bytes(text))
    for pair in merges:                      # replay merges in order
        tokens = merge_everywhere(tokens, pair)
    return tokens`}
        />
        <P>
          Frequent strings (&ldquo;the&rdquo;, &ldquo;ing&rdquo;, &ldquo; and&rdquo;) climb the merge ladder into
          single tokens; rare words decompose into familiar pieces; anything at all — typos, emoji, code — falls back
          to bytes. Nothing is ever &ldquo;out of vocabulary.&rdquo;
        </P>

        <AdvH>The trade-off, quantified</AdvH>
        <P>
          Why ~100k and not a million? The embedding table from the Words-as-Numbers lesson costs{" "}
          <MathInline tex={String.raw`|V| \times d`} /> parameters (100k tokens × 12k dims ≈ a billion parameters in a
          frontier model — just for the dictionary). Bigger <MathInline tex={String.raw`|V|`} /> also makes the final
          softmax over the vocabulary pricier, but shortens sequences — and since attention costs{" "}
          <MathInline tex={String.raw`O(t^2)`} /> in sequence length <MathInline tex={String.raw`t`} />, fewer, fatter
          tokens are usually worth it. English averages ≈ 4 characters per token; languages the merges weren&apos;t
          trained on can need 2–3× more tokens for the same sentence — same words, multiplied API bill.
        </P>
        <P>
          And the strawberry mystery, fully solved: <Code>strawberry</Code> arrives as token IDs like{" "}
          <Code>[straw, berry]</Code>. Counting the R&apos;s inside them is asking about <Em>bytes the model never
          receives</Em>. It can only answer from having read text about strawberry&apos;s spelling — memory, not
          inspection.
        </P>
      </AdvancedSection>
    </Prose>
  );
}
