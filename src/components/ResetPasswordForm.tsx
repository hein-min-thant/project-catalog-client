import React, { useState } from "react";
import { Eye, EyeOff, Lock, Loader2, ArrowLeft } from "lucide-react";
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

interface ResetPasswordFormProps {
  email: string;
  onPasswordReset: () => void;
  onBack: () => void;
}

export default function ResetPasswordForm({
  email,
  onPasswordReset,
  onBack,
}: ResetPasswordFormProps) {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast("Error", {
        description: "Passwords do not match",
        className:
          "bg-red-500/90 text-white dark:bg-red-700/90 px-4 py-3 rounded-xl shadow-lg",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast("Error", {
        description: "Password must be at least 6 characters long",
        className:
          "bg-red-500/90 text-white dark:bg-red-700/90 px-4 py-3 rounded-xl shadow-lg",
      });
      return;
    }

    setLoading(true);
    try {
      await api.post("/users/reset-password", {
        email,
        code,
        newPassword,
      });

      toast("Success", {
        description: "Password has been reset successfully",
        className:
          "bg-green-500/90 text-white dark:bg-green-700/90 px-4 py-3 rounded-xl shadow-lg",
      });

      onPasswordReset();
    } catch (error: any) {
      toast("Error", {
        description:
          error.response?.data?.message || "Failed to reset password",
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
          <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl">
            <Lock className="h-6 w-6 text-green-500" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Set New Password
          </CardTitle>
          <CardDescription className="text-base">
            Enter the code sent to {email}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="code" className="font-medium">
              Reset Code
            </Label>
            <Input
              required
              id="code"
              placeholder="Enter 6-digit code"
              type="text"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-green-500/20 h-11 text-center text-lg tracking-widest"
              maxLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="newPassword"
              className="font-medium flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              New Password
            </Label>
            <div className="relative">
              <Input
                required
                id="newPassword"
                placeholder="Enter new password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-green-500/20 h-11 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-default-500" />
                ) : (
                  <Eye className="h-4 w-4 text-default-500" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-medium">
              Confirm Password
            </Label>
            <Input
              required
              id="confirmPassword"
              placeholder="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-green-500/20 h-11"
            />
          </div>

          <div className="space-y-4 pt-2">
            <Button
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-11"
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Reset Password
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-default-600 hover:text-default-700"
              onClick={onBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
