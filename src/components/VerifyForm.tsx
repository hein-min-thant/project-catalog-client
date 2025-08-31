import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import api from "@/config/api";

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().min(4, "Code must be at least 4 digits"),
});

type VerifyFormData = z.infer<typeof verifySchema>;

interface VerifyFormProps {
  email: string;
  onBack?: () => void;
}

// --- Card UI helpers (same as OTPForm) ---------------------------------
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

export default function VerifyForm({ email, onBack }: VerifyFormProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: { email },
  });

  useEffect(() => {
    setValue("email", email);
  }, [email, setValue]);

  const onVerifySubmit = async (data: VerifyFormData) => {
    setLoading(true);
    try {
      const res = await api.post("/users/register/verify-and-create", {
        email: data.email,
        code: data.code,
      });

      if (res.status === 200 || res.status === 201) {
        toast("Success", {
          description: "Registered successfully!",
          className:
            "bg-green-500/90 text-white dark:bg-green-600 px-4 py-3 rounded-xl shadow-lg",
        });
        navigate("/login");
      }
    } catch (err: any) {
      toast("Error", {
        description: err.message,
        className:
          "bg-red-500/90 text-white dark:bg-red-700/90 px-4 py-3 rounded-xl shadow-lg",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full md:w-[400px] bg-gradient-to-br from-background via-background to-gray-50/30 dark:to-gray-800/30 border-border/50">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex justify-center">
          <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-base">
            We've sent a verification code to
          </CardDescription>
          <p className="font-medium text-green-600">{email}</p>
        </div>
      </CardHeader>

      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(onVerifySubmit)}>
          <div className="space-y-2">
            <label
              htmlFor="code"
              className="font-medium flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Verification Code
            </label>
            <Input
              {...register("code")}
              id="code"
              maxLength={6}
              placeholder="Enter 6-digit code"
              className="border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-green-500/20 h-11 text-center text-lg tracking-widest"
            />
            <p className="text-xs text-default-500 text-center">
              Enter the 6-digit code sent to your email
            </p>
            {errors.code && (
              <p className="text-red-500 text-sm">{errors.code.message}</p>
            )}
          </div>

          <input type="hidden" {...register("email")} />

          <Button
            color="primary"
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-11"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Verify & Sign In
              </>
            )}
          </Button>
        </form>
        {onBack && (
          <Button
            className="w-full mt-6 border-green-500/20 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/50"
            type="button"
            variant="outline"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Register
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
