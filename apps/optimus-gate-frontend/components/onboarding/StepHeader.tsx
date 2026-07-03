type StepHeaderProps = {
  step?: { title: string };
  index?: number;
  total?: number;
};

export default function StepHeader({ step, index = 0, total = 1 }: StepHeaderProps) {
  return (
    <div className="py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
        Step {index + 1} of {total}
      </p>
      <h2 className="mt-1 text-xl font-black text-black">
        {step?.title ?? "Onboarding"}
      </h2>
    </div>
  );
}
