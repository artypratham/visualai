import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getLesson, getChapter, getAdjacentLessons, lessons } from "@/lib/curriculum";
import { lessonContent } from "@/content/lessons";
import { LessonHero } from "@/components/lesson/LessonHero";
import { LessonFooter } from "@/components/lesson/LessonFooter";
import { ReadingProgress } from "@/components/lesson/ReadingProgress";
import { ComingSoon } from "@/components/artifacts/ComingSoon";
import { Prose, Lead, P } from "@/components/lesson/prose";

export function generateStaticParams() {
  return lessons.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return { title: "Lesson not found" };
  return {
    title: lesson.title,
    description: lesson.hook,
  };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const chapter = getChapter(lesson.chapterId)!;
  const { prev, next } = getAdjacentLessons(slug);
  const Content = lessonContent[slug];

  return (
    <article className="px-5 pb-20 sm:px-8">
      <ReadingProgress />
      <LessonHero lesson={lesson} chapter={chapter} />

      <div className="mt-8">
        {Content ? (
          <Content />
        ) : (
          <Prose>
            <Lead>{lesson.hook}</Lead>
            <P>{lesson.takeaway}</P>
            <div className="my-10">
              <ComingSoon title={lesson.title} />
            </div>
            <P>
              The lessons before this one are ready to play with right now — start there and this will be waiting
              when you arrive.
            </P>
            <div className="mt-6">
              <Link href="/learn" className="inline-flex items-center gap-1.5 font-medium text-accent hover:text-accent-hover">
                Back to the roadmap <ArrowRight size={15} />
              </Link>
            </div>
          </Prose>
        )}
      </div>

      <LessonFooter slug={slug} prev={prev} next={next} />
    </article>
  );
}
