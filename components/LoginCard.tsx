"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/validators/auth";
import { Eye, EyeOff, Loader2, LogIn, X } from "lucide-react";

type LoginData = {
  email: string;
  password: string;
};

interface LoginCardProps {
  onClose?: () => void;
  onSwitchToSignup?: () => void;
}

export default function LoginCard({ onClose, onSwitchToSignup }: LoginCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });
  const router = useRouter();

  const onSubmit = async (data: LoginData) => {
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.needsVerification) {
          router.push("/resend-verification");
          return;
        }
        setError(result.error || "Login failed.");
        return;
      }

      if (onClose) onClose();
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white border border-zinc-200 rounded-2xl shadow-xl relative text-zinc-900">
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 transition-colors p-1"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      <div className="text-center space-y-2 mb-6">
        <div className="mx-auto h-12 w-12 bg-zinc-50 border border-zinc-150 rounded-xl flex items-center justify-center">
          <LogIn className="h-6 w-6 text-zinc-900" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
        <p className="text-zinc-500 text-sm">Sign in to your account</p>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-zinc-600">Email Address</label>
          <input
            type="email"
            placeholder="name@example.com"
            className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-shadow"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-650 text-xs mt-0.5">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-zinc-600">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full pl-3.5 pr-10 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-shadow"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 p-1"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-650 text-xs mt-0.5">{errors.password.message}</p>
          )}
        </div>

        <div className="flex justify-end text-xs">
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="text-zinc-500 hover:text-zinc-900 hover:underline font-medium"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2 rounded-lg text-sm shadow-sm transition-colors duration-150 flex items-center justify-center disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-500 border-t border-zinc-100 pt-4">
        Don&apos;t have an account?{" "}
        {onSwitchToSignup ? (
          <button
            onClick={onSwitchToSignup}
            type="button"
            className="text-zinc-900 hover:underline font-semibold"
          >
            Sign up
          </button>
        ) : (
          <button
            onClick={() => router.push("/signup")}
            type="button"
            className="text-zinc-900 hover:underline font-semibold"
          >
            Sign up
          </button>
        )}
      </div>
    </div>
  );
}
