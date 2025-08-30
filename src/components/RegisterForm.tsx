/* eslint-disable jsx-a11y/label-has-associated-control */
import { Button, Checkbox, Link, addToast } from "@heroui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";

import api from "@/config/api";

const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    terms: z.literal(true).refine((val) => val === true, {
      message: "You must agree",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onRegistrationSuccess: (email: string) => void;
}

// --- Card UI helpers (same as CredentialsForm) ---------------------------
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function RegisterForm({
  onRegistrationSuccess,
}: RegisterFormProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await api.post("/users/register/request-code", {
        name: data.username,
        email: data.email,
        password: data.password,
      });
      addToast({
        title: "Success",
        description: "Verification code sent to your email.",
        color: "primary",
      });
      onRegistrationSuccess(data.email);
    } catch (err: any) {
      addToast({
        title: "Error",
        description: err.response?.data?.email || "Error sending code",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-[400px] bg-gradient-to-br from-background via-background to-gray-50/30 dark:to-gray-800/30 border-border/50">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex justify-center">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl">
            <User className="h-6 w-6 text-purple-500" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription className="text-base">
            Fill in the details below to get started
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(onRegisterSubmit)}>
          {/* Username */}
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="font-medium flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Username
            </label>
            <input
              {...register("username")}
              id="username"
              placeholder="Choose a username"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.username
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-background h-11`}
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="font-medium flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email Address
            </label>
            <input
              {...register("email")}
              id="email"
              type="email"
              placeholder="Enter your email address"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.email
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-background h-11`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="font-medium flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                id="password"
                type={isVisible ? "text" : "password"}
                placeholder="Create a strong password"
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.password
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } bg-background h-11`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setIsVisible(!isVisible)}
              >
                {isVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="font-medium flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Confirm Password
            </label>
            <div className="relative">
              <input
                {...register("confirmPassword")}
                id="confirmPassword"
                type={isConfirmVisible ? "text" : "password"}
                placeholder="Confirm your password"
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } bg-background h-11`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setIsConfirmVisible(!isConfirmVisible)}
              >
                {isConfirmVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms */}
          <div className="space-y-2">
            <Checkbox
              {...register("terms")}
              size="sm"
              className={`py-2 ${errors.terms ? "text-red-500" : ""}`}
            >
              I agree with the&nbsp;
              <Link href="#" size="sm">
                Terms
              </Link>
              &nbsp;and&nbsp;
              <Link href="#" size="sm">
                Privacy Policy
              </Link>
            </Checkbox>
            {errors.terms && (
              <p className="text-red-500 text-sm">{errors.terms.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            color="primary"
            isLoading={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-11"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
