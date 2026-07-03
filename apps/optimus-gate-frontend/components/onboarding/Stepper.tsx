type StepperProps = {
  currentStep?: number;
  steps?: readonly { id: string; title: string }[];
};

export default function Stepper({ currentStep = 0, steps = [] }: StepperProps) {
  return (
    <div className="flex gap-2">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`h-1 flex-1 rounded-full ${
            index <= currentStep ? "bg-black" : "bg-zinc-200"
          }`}
        />
      ))}
    </div>
  );
}
