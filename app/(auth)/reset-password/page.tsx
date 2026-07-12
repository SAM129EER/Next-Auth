"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/lib/validators/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { KeyRound, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";

type FormData = { token: string; password: string; confirmPassword: string };

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = async (data: FormData) => {
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(result.error || "Failed to reset password.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md p-6 bg-white border border-zinc-200 text-zinc-900 shadow-sm">
        <CardHeader className="text-center space-y-3">
          <KeyRound className="mx-auto h-12 w-12 text-red-500" />
          <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Invalid Link</CardTitle>
          <CardDescription className="text-zinc-500 text-sm">
            This password reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/forgot-password" className="w-full block">
            <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium">Request a New Link</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md p-6 bg-white border border-zinc-200 text-zinc-900 shadow-sm">
        <CardHeader className="text-center space-y-3">
          <ShieldCheck className="mx-auto h-12 w-12 text-emerald-600" />
          <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Password Reset!</CardTitle>
          <CardDescription className="text-zinc-500 text-sm">
            Your password has been reset successfully. Redirecting to login...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md">
      <Card className="p-6 bg-white border border-zinc-200 text-zinc-900 shadow-sm">
        <CardHeader className="text-center space-y-3">
          <KeyRound className="mx-auto h-12 w-12 text-zinc-900" />
          <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Reset Password</CardTitle>
          <CardDescription className="text-zinc-500 text-sm">
            Enter your new password below.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-55 border border-red-200 p-3 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <input type="hidden" {...register("token")} />

          <div className="space-y-1">
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                placeholder="New password"
                className="bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:ring-zinc-900 pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Input
              type={show ? "text" : "password"}
              placeholder="Confirm new password"
              className="bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:ring-zinc-900"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium" disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Resetting...</>
            ) : (
              "Reset Password"
            )}
          </Button>
        </CardContent>

        <CardFooter className="justify-center text-sm">
          <Link href="/login" className="text-zinc-900 hover:underline transition-colors font-medium">
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Suspense fallback={
        <Card className="w-full max-w-md p-6 bg-white border border-zinc-200 text-zinc-900 shadow-sm">
          <CardHeader className="text-center space-y-3">
            <Loader2 className="mx-auto h-12 w-12 text-zinc-900 animate-spin" />
            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Loading...</CardTitle>
          </CardHeader>
        </Card>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
