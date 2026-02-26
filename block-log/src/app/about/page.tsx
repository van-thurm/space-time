'use client';

import { SecondaryPageHeader } from '@/components/ui/SecondaryPageHeader';
import { AppFooter } from '@/components/ui/AppFooter';

const BLOCK_TYPES = [
  { phase: 'base / hypertrophy', focus: 'more reps, more total work, moderate weights', goal: 'build muscle and work capacity' },
  { phase: 'strength / intensity', focus: 'heavier weights, fewer reps', goal: 'turn muscle into force' },
  { phase: 'peak / pr-focused', focus: 'very heavy, low volume, more recovery', goal: 'reach new personal bests' },
  { phase: 'reset / deload', focus: 'lower stress, drop fatigue', goal: 'set up the next push' },
];

const FIST_ART = `    ⢀⢀⠔⠒⢄
⢀⡠⠤⢔⠉⠀⠉⡆⠀⣀⣷
⡤⠶⠥⠀⢀⡄⣇⣖⠒⢿⠍⠀⢸⡆
⣼⡆⠀⠀⠆⠈⠀⡇⠣⢁⡁⠀⣠⡦⢰⡀
⡗⢳⡀⢀⢸⠀⠀⡇⣀⢘⣉⡿⠋⠄⠀⢳
⣧⡆⠑⠚⠳⠦⢽⣧⠤⠏⠀⠈⠁⠀⠌⡼
⢻⠇⠀⠀⠀⢀⠶⡇⠀⠀⠀⠀⠀⡠⡼⠁
⠀⢷⡀⠀⠀⠈⠀⢷⡀⠀⠀⠀⢊⡼⠁
⠀⠸⡐⡀⢀⣀⣒⣀⠝⠔⢰⣣⡏
⠀⠀⢳⡤⠀⢀⠀⠐⠛⢻⠃⠸⡇
⠀⠀⢸⡘⡀⠀⠑⡀⠰⢸⠀⠀⢧
⠀⠀⠀⣇⠀⠀⠀⠀⠀⣆⠆⠀⢹⡄`;

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <SecondaryPageHeader subtitle="about" backFallbackHref="/" />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
        {/* Intro */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl">what is a block?</h2>
          <p className="font-sans text-sm leading-relaxed text-foreground/90">
            a block is a focused chunk of training time where you pursue one primary goal
            and let everything else chill in the background. it&apos;s how serious athletes
            structure training so they can keep progressing for years on end.
          </p>
          <p className="font-sans text-sm leading-relaxed text-foreground/90">
            a block = X weeks of training built around a chosen priority: build muscle,
            build strength, peak, or rebuild. inside a block, sets, reps, and weight change
            on purpose over time (progressive overload), not at random.
          </p>
          <p className="font-sans text-sm leading-relaxed text-muted">
            you don&apos;t try to max every quality at once; you push one thing, maintain the rest,
            then move on to the next thing.
          </p>
        </section>

        {/* Block types table */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl">how lifters use blocks</h2>
          <div className="border border-border">
            <div className="grid grid-cols-3 border-b border-border bg-surface/50">
              <div className="p-3 font-sans text-xs text-muted uppercase tracking-wide">phase</div>
              <div className="p-3 font-sans text-xs text-muted uppercase tracking-wide">focus</div>
              <div className="p-3 font-sans text-xs text-muted uppercase tracking-wide">goal</div>
            </div>
            {BLOCK_TYPES.map((row) => (
              <div key={row.phase} className="grid grid-cols-3 border-b border-border last:border-b-0">
                <div className="p-3 font-sans text-sm font-semibold">{row.phase}</div>
                <div className="p-3 font-sans text-sm text-foreground/80">{row.focus}</div>
                <div className="p-3 font-sans text-sm text-muted">{row.goal}</div>
              </div>
            ))}
          </div>
          <p className="font-sans text-sm leading-relaxed text-foreground/90">
            you don&apos;t have to follow a rigid template or traditional lifting program within
            this framework. use blocks for mobility, improving your vertical, or even building
            mental resilience. the point is: focused effort over a defined timeframe beats
            random training every time.
          </p>
        </section>

        {/* How to build */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl">how to build a block</h2>
          <div className="space-y-4">
            <div className="border-l-2 border-accent pl-4">
              <p className="font-sans text-sm font-semibold">pick a main goal</p>
              <p className="font-sans text-sm text-muted">that part&apos;s up to you.</p>
            </div>
            <div className="border-l-2 border-accent pl-4">
              <p className="font-sans text-sm font-semibold">choose a length</p>
              <p className="font-sans text-sm text-muted">
                2–12 weeks; shorter for heavy phases, longer for base work.
                you can tweak the templates to match your needs.
              </p>
            </div>
            <div className="border-l-2 border-accent pl-4">
              <p className="font-sans text-sm font-semibold">choose workouts / exercises</p>
              <p className="font-sans text-sm text-muted">
                base/volume blocks focus on variation, compound lifts, and accessories.
                strength and performance blocks focus on more isolated work.
              </p>
            </div>
            <div className="border-l-2 border-accent pl-4">
              <p className="font-sans text-sm font-semibold">decide how you progress</p>
              <p className="font-sans text-sm text-muted">
                add weight week to week, or add sets/reps, or more difficult exercises.
                it&apos;s your program, you get to decide.
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <hr className="border-border" />

        {/* About block log */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl">about block log</h2>
          <p className="font-sans text-sm leading-relaxed text-foreground/90">
            strength training is personal, but it&apos;s not just about the individual.
            the gym can be a place to build resilience, autonomy, and community.
            a place to reclaim time and energy for the things that matter.
          </p>
          <p className="font-sans text-sm leading-relaxed text-foreground/90">
            that&apos;s what block log is really about — strength for you, solidarity for all of us.
          </p>
        </section>

        {/* Fist art */}
        <div className="flex justify-center py-6">
          <pre className="font-mono text-sm leading-tight text-muted select-none" aria-hidden="true">
            {FIST_ART}
          </pre>
        </div>
      </div>

      <AppFooter />
    </main>
  );
}
