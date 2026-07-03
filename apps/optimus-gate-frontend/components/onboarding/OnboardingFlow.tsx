"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { z } from "zod";
import { onboardingSchema, OnboardingData } from "@/lib/schemas/onboarding";
import { steps } from "@/lib/steps.config";
import BusinessProfileStep from "./steps/BusinessProfileStep";
import ContactStep from "./steps/ContactStep";
import BillingConfigStep from "./steps/BillingConfigStep";
import PayoutAccountStep from "./steps/PayoutAccountStep";
import ReviewStep from "./steps/ReviewStep";
import StepFooter from "./StepFooter";
import StepHeader from "./StepHeader";
import Stepper from "./Stepper";

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  type OnboardingInput = z.input<typeof onboardingSchema>;

  const methods = useForm<OnboardingInput, unknown, OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: {
      businessName: "",
      businessDescription: "",
      businessCategory: "",
      staffSize: "",
      annualSalesVolume: undefined,
      email: "",
      phoneCountryCode: "+234",
      phone: "",
      currency: "NGN",
      webhookUrl: "",
      bankName: "",
      accountNumber: "",
      accountName: "",
      agreeToTerms: false,
    },
  });

  const next = async () => {
    const fields = steps[currentStep].fields as (keyof OnboardingInput)[];
    const valid = await methods.trigger(fields);
    if (valid) setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const back = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const onSubmit = (data: OnboardingData) => {
    console.log(data); // wire to your API call here
  };

  return (
    <FormProvider {...methods}>
      <Stepper currentStep={currentStep} steps={steps} />
      <StepHeader
        step={steps[currentStep]}
        index={currentStep}
        total={steps.length}
      />

      <form onSubmit={methods.handleSubmit(onSubmit)}>
        {currentStep === 0 && <BusinessProfileStep />}
        {currentStep === 1 && <ContactStep />}
        {currentStep === 2 && <BillingConfigStep />}
        {currentStep === 3 && <PayoutAccountStep />}
        {currentStep === 4 && <ReviewStep data={methods.getValues()} />}

        <StepFooter
          currentStep={currentStep}
          totalSteps={steps.length}
          onBack={back}
          onNext={next}
          isLastStep={currentStep === steps.length - 1}
        />
      </form>
    </FormProvider>
  );
}
