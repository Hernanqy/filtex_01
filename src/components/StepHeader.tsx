type StepHeaderProps = {
  step: number;
  totalSteps: number;
  title: string;
  subtitle: string;
};

export function StepHeader({ step, totalSteps, title, subtitle }: StepHeaderProps) {
  const progress = (step / totalSteps) * 100;

  return (
    <header className="mb-8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-neutral-500">
            Orden de trabajo
          </p>
          <h2 className="max-w-xl text-4xl font-black tracking-[-0.06em] text-black md:text-5xl">
            {title}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500 md:text-base">
            {subtitle}
          </p>
        </div>

        <div className="rounded-full bg-black px-5 py-3 text-sm font-black text-white">
          Paso {step}/{totalSteps}
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-black transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
