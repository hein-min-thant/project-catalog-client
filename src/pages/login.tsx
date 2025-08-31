import { useState } from "react";

import DefaultLayout from "@/layouts/default";
import CredentialsForm from "@/components/CredentailsForm";
import OTPForm from "@/components/OTPForm";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import ResetPasswordForm from "@/components/ResetPasswordForm";

type AuthStep = "credentials" | "otp" | "forgot-password" | "reset-password";

export default function LoginPage() {
  const [step, setStep] = useState<AuthStep>("credentials");
  const [email, setEmail] = useState("");
  const [, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const handleCredentialsSubmit = (
    submittedEmail: string,
    submittedPassword: string
  ) => {
    setEmail(submittedEmail);
    setPassword(submittedPassword);
    setStep("otp");
  };

  const handleForgotPasswordClick = () => {
    setStep("forgot-password");
  };

  const handleCodeSent = (submittedEmail: string) => {
    setResetEmail(submittedEmail);
    setStep("reset-password");
  };

  const handlePasswordReset = () => {
    setStep("credentials");
    setResetEmail("");
  };

  const handleBackToCredentials = () => {
    setStep("credentials");
  };

  const handleBackToForgotPassword = () => {
    setStep("forgot-password");
  };

  const renderCurrentStep = () => {
    switch (step) {
      case "credentials":
        return (
          <CredentialsForm
            onCredentialsSubmit={handleCredentialsSubmit}
            onForgotPassword={handleForgotPasswordClick}
          />
        );
      case "otp":
        return <OTPForm email={email} onBack={handleBackToCredentials} />;
      case "forgot-password":
        return (
          <ForgotPasswordForm
            onCodeSent={handleCodeSent}
            onBackToLogin={handleBackToCredentials}
          />
        );
      case "reset-password":
        return (
          <ResetPasswordForm
            email={resetEmail}
            onPasswordReset={handlePasswordReset}
            onBack={handleBackToForgotPassword}
          />
        );
      default:
        return null;
    }
  };

  return (
    <DefaultLayout>
      <div className="flex h-full w-full items-center justify-center px-0 md:px-4 py-8">
        <div className="w-full max-w-md">{renderCurrentStep()}</div>
      </div>
    </DefaultLayout>
  );
}
