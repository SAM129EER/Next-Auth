"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validators/auth";
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
import { KeyRound, Loader2, CheckCircle2 } from "lucide-react";

type FormData = { email: string };

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: FormData) => {
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(result.error || "Something went wrong.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <Card className="w-full max-w-md p-6 bg-white border border-zinc-200 text-zinc-900 shadow-sm">
          <CardHeader className="text-center space-y-3">
            <CheckCircle2 className="mx-auto h-12 w-12 text-zinc-900" />
            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Check Your Email</CardTitle>
            <CardDescription className="text-zinc-500 text-sm">
              If an account exists with that email, we&apos;ve sent a password reset link. Please check your inbox.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login" className="w-full block">
              <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md">
        <Card className="p-6 bg-white border border-zinc-200 text-zinc-900 shadow-sm">
          <CardHeader className="text-center space-y-3">
            <KeyRound className="mx-auto h-12 w-12 text-zinc-900" />
            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Forgot Password?</CardTitle>
            <CardDescription className="text-zinc-500 text-sm">
              No worries! Enter your email and we&apos;ll send you a reset link.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:ring-zinc-900"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Sending...</>
              ) : (
                "Send Reset Link"
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
    </div>
  );
}
