import { Button } from "@/components/ui/Button";
import { firstReadyLesson } from "@/lib/curriculum";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-5 text-center">
      <div>
        <p className="font-display text-7xl font-medium text-gradient">404</p>
        <h1 className="mt-4 font-display text-2xl font-medium text-foreground">This page wandered off.</h1>
        <p className="mt-2 text-muted">The lesson you&apos;re after doesn&apos;t exist — but the roadmap does.</p>
        <div className="mt-7 flex justify-center gap-3">
          <Button href="/" variant="secondary">
            Go home
          </Button>
          <Button href={`/learn/${firstReadyLesson.slug}`}>Start learning</Button>
        </div>
      </div>
    </div>
  );
}
