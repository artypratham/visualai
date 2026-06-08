import { Prose, Lead, P, H2, Strong, Em, Term } from "@/components/lesson/prose";
import { Callout } from "@/components/lesson/Callout";
import { ArtifactFrame } from "@/components/lesson/ArtifactFrame";
import { PixelInspector } from "@/components/artifacts/PixelInspector";

export function EverythingIsNumbersContent() {
  return (
    <Prose>
      <Lead>
        AI doesn&apos;t see images, hear sounds, or read words. It only ever sees numbers. Once that clicks,
        the magic turns into something you can actually reason about.
      </Lead>

      <P>
        A screen is a grid of tiny squares called <Strong>pixels</Strong>. Each pixel is just a brightness
        value — a number. A black-and-white image is therefore nothing more than a grid of numbers, where 0
        means &ldquo;no ink&rdquo; and 255 means &ldquo;full ink.&rdquo; Draw something below, then flip from{" "}
        <Strong>Picture</Strong> to <Strong>Numbers</Strong> and meet the image the way a computer does.
      </P>

      <ArtifactFrame
        title="Pixel Inspector"
        hint="Draw with your mouse, then switch the view"
        caption="Same grid, two views. The picture is for you; the numbers are for the machine."
      >
        <PixelInspector />
      </ArtifactFrame>

      <Callout tone="try">
        <p>
          Hit the <Strong>7</Strong> stamp, then toggle to <Strong>Numbers</Strong>. The shape you recognise
          instantly becomes a grid of values — and the long list underneath is <Em>literally</Em> what gets fed
          into a model. Now bump the <Strong>resolution</Strong> up and down: more pixels means more numbers,
          means more detail the AI can pick up on.
        </p>
      </Callout>

      <H2>From a grid to a list</H2>
      <P>
        Look at the row of numbers beneath the canvas. The model doesn&apos;t even keep the square shape — it
        flattens the whole grid into one long line of numbers, reading left to right, top to bottom. A 28×28
        handwriting image (the classic teaching dataset) becomes a list of{" "}
        <Term define="28 times 28. The famous MNIST digit images are exactly this size.">784 numbers</Term>.
        That list <Em>is</Em> the input. Lesson 1&apos;s dots had two numbers each (an x and a y); a digit just
        has 784 of them.
      </P>

      <Callout tone="key">
        <p>
          Everything an AI works with is turned into numbers first. Images become grids of pixel values, and
          those grids become lists. Sound becomes a list of air-pressure samples. Even words become numbers — a
          trick so important it gets its own chapter later.
        </p>
      </Callout>

      <P>
        Colour works the same way, just three times over: each pixel gets a <Strong>Red</Strong>,{" "}
        <Strong>Green</Strong> and <Strong>Blue</Strong> value. Mix those three numbers and you can make any
        colour on screen. So a colour photo is three stacked grids of numbers — but the principle never changes.
      </P>

      <Callout tone="recap">
        <p>
          This is why AI is &ldquo;just maths.&rdquo; Once a cat photo is a list of numbers, finding cats becomes
          finding a pattern in numbers — and finding patterns in numbers is something we can teach a machine to
          do. That hunt for the pattern is exactly where we&apos;re headed next.
        </p>
      </Callout>
    </Prose>
  );
}
