"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/validators/auth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, UserPlus, X } from "lucide-react";
import { z } from "zod";

type SignupData = z.infer<typeof signupSchema>;

interface SignupCardProps {
  onClose?: () => void;
  onSwitchToLogin?: () => void;
}

export default function SignupCard({ onClose, onSwitchToLogin }: SignupCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupData) => {
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Signup failed.");
        return;
      }

      if (onClose) onClose();
      router.push("/verify-email");
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
          <UserPlus className="h-6 w-6 text-zinc-900" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
        <p className="text-zinc-500 text-sm">Sign up to get started</p>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-650">First Name</label>
            <input
              type="text"
              placeholder="John"
              className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              {...register("first")}
            />
            {errors.first && (
              <p className="text-red-600 text-xs mt-0.5">{errors.first.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-650">Last Name</label>
            <input
              type="text"
              placeholder="Doe"
              className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              {...register("last")}
            />
            {errors.last && (
              <p className="text-red-600 text-xs mt-0.5">{errors.last.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-zinc-650">Email Address</label>
          <input
            type="email"
            placeholder="name@example.com"
            className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-600 text-xs mt-0.5">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-zinc-650">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full pl-3.5 pr-10 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
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
            <p className="text-red-600 text-xs mt-0.5">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-zinc-650">Confirm Password</label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-red-600 text-xs mt-0.5">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2 rounded-lg text-sm shadow-sm transition-colors duration-150 flex items-center justify-center disabled:opacity-50 mt-2 cursor-pointer"
        >
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-500 border-t border-zinc-100 pt-4">
        Already have an account?{" "}
        {onSwitchToLogin ? (
          <button
            onClick={onSwitchToLogin}
            type="button"
            className="text-zinc-900 hover:underline font-semibold"
          >
            Login
          </button>
        ) : (
          <button
            onClick={() => router.push("/login")}
            type="button"
            className="text-zinc-900 hover:underline font-semibold"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}
