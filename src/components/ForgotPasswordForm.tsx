import React, { useState } from "react";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import api from "../config/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface ForgotPasswordFormProps {
  onCodeSent: (email: string) => void;
  onBackToLogin: () => void;
}

export default function ForgotPasswordForm({
  onCodeSent,
  onBackToLogin,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/users/forgot-password", { email });
      toast("Success", {
        description: "Password reset code sent to your email",
        className:
          "bg-green-500/90 text-white dark:bg-green-700/90 px-4 py-3 rounded-xl shadow-lg",
      });
      onCodeSent(email);
    } catch (error: any) {
      toast("Error", {
        description:
          error.response?.data?.message || "Failed to send reset code",
        className:
          "bg-red-500/90 text-white dark:bg-red-700/90 px-4 py-3 rounded-xl shadow-lg",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full md:w-[400px] bg-gradient-to-br from-background via-background to-gray-50/30 dark:to-gray-800/30 border-border/50">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex justify-center">
          <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl">
            <Mail className="h-6 w-6 text-orange-500" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Reset Password
          </CardTitle>
          <CardDescription className="text-base">
            Enter your email to receive a reset code
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="font-medium flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              required
              id="email"
              placeholder="Enter your email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500/20 h-11"
            />
          </div>

          <div className="space-y-4 pt-2">
            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-11"
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Code
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-default-600 hover:text-default-700"
              onClick={onBackToLogin}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
