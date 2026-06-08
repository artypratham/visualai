import { Prose, Lead, P, H2, Strong, Em, Term } from "@/components/lesson/prose";
import { Callout } from "@/components/lesson/Callout";
import { ArtifactFrame } from "@/components/lesson/ArtifactFrame";
import { TeachTheMachine } from "@/components/artifacts/TeachTheMachine";

export function WhatIsAiContent() {
  return (
    <Prose>
      <Lead>
        For seventy years, making a computer do something meant writing down the exact rules. AI is the moment
        we stopped writing rules — and started showing examples instead.
      </Lead>

      <P>
        Think about how you&apos;d teach a computer to recognise a cat. You could try writing rules: <Em>has
        pointy ears, has whiskers, has fur…</Em> But a dog has those too. A cat curled up in a ball has no
        visible ears at all. The rules pile up, contradict each other, and still miss a thousand cases.
      </P>
      <P>
        Now imagine a different approach. You don&apos;t write a single rule. You just show the computer
        thousands of pictures labelled <Strong>cat</Strong> or <Strong>not cat</Strong>, and let it work out
        the pattern on its own. <Strong>That&apos;s the whole idea of AI.</Strong> Let&apos;s do exactly that —
        in miniature.
      </P>

      <ArtifactFrame
        title="Teach the Machine"
        hint="Click the canvas to add examples"
        caption="You're not programming a boundary. You're giving examples — and the machine fills in the rest."
      >
        <TeachTheMachine />
      </ArtifactFrame>

      <Callout tone="try">
        <p>
          Drop a few <Strong>Class A</Strong> dots in one corner and <Strong>Class B</Strong> dots in another.
          Watch the background bloom into two coloured territories — that&apos;s the machine&apos;s guess for
          every point it hasn&apos;t seen. Now drag the ringed <Strong>mystery dot</Strong> around and watch its
          prediction flip. Then hit <Strong>New example set → Island</Strong>: a straight line could never split
          those, yet examples handle it easily.
        </p>
      </Callout>

      <H2>What just happened?</H2>
      <P>
        You never wrote &ldquo;if the dot is in the bottom-left, call it Class A.&rdquo; You placed examples, and
        to classify the mystery dot the machine simply asked:{" "}
        <Em>which of my known examples are closest?</Em> The closest ones vote. That&apos;s a real algorithm
        called{" "}
        <Term define="k-Nearest Neighbours: classify a new point by a majority vote of its k closest labelled examples.">
          k-Nearest Neighbours
        </Term>
        , and the slider labelled <Strong>k</Strong> sets how many neighbours get a vote.
      </P>
      <P>
        Two pieces of vocabulary you&apos;ll meet everywhere from here on. The dots you placed are the{" "}
        <Term define="The labelled examples an AI learns from.">training data</Term>. The thing that turns a new
        input into a prediction — the coloured map — is the{" "}
        <Term define="The thing that makes predictions after learning from data.">model</Term>.
      </P>

      <Callout tone="key">
        <p>
          Traditional software: a human writes the rules, the computer follows them. AI flips it: the human
          provides examples, and the computer writes the rule. Change the examples and the rule changes — no
          reprogramming required.
        </p>
      </Callout>

      <P>
        This also explains AI&apos;s biggest weakness. The model only knows what its examples taught it. Feed it
        lopsided or biased examples and it will confidently learn the wrong pattern. <Em>Garbage in, garbage
        out</Em> — but learned, not coded.
      </P>

      <Callout tone="recap">
        <p>
          Every AI you&apos;ve heard of — spam filters, face unlock, ChatGPT — is this one idea scaled up
          enormously: collect examples, find the pattern, predict the next case. The only real question left is{" "}
          <Strong>what those examples are actually made of.</Strong> Spoiler: it&apos;s numbers. That&apos;s the
          next lesson.
        </p>
      </Callout>
    </Prose>
  );
}
