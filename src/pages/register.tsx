import { useState } from "react";

import RegisterForm from "@/components/RegisterForm";
import DefaultLayout from "@/layouts/default";
import VerifyForm from "@/components/VerifyForm";

export default function RegisterPage() {
  const [step, setStep] = useState<"register" | "verify">("register");
  const [registeredEmail, setRegisteredEmail] = useState<string>("");

  const handleRegistrationSuccess = (email: string) => {
    setRegisteredEmail(email);
    setStep("verify");
  };

  const handleBackToRegister = () => {
    setStep("register");
  };

  return (
    <DefaultLayout>
      <div className="flex h-full w-full items-center justify-center px-0 md:px-4 py-8">
        <div className="w-full max-w-md">
          {step === "register" ? (
            <RegisterForm onRegistrationSuccess={handleRegistrationSuccess} />
          ) : (
            <VerifyForm email={registeredEmail} onBack={handleBackToRegister} />
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
