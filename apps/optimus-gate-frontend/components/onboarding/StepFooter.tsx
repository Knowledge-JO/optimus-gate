import { Button } from "@/components/ui/button";

type StepFooterProps = {
  currentStep?: number;
  totalSteps?: number;
  onBack?: () => void;
  onNext?: () => void | Promise<void>;
  isLastStep?: boolean;
};

export default function StepFooter({
  currentStep = 0,
  totalSteps = 1,
  onBack,
  onNext,
  isLastStep,
}: StepFooterProps) {
  return (
    <div className="mt-6 flex items-center justify-between border-t pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={currentStep === 0}
      >
        Back
      </Button>
      <Button type={isLastStep ? "submit" : "button"} onClick={isLastStep ? undefined : onNext}>
        {isLastStep || currentStep === totalSteps - 1 ? "Submit" : "Continue"}
      </Button>
    </div>
  );
}
