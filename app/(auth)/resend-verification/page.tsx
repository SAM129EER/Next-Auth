"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resendVerificationSchema } from "@/lib/validators/auth";
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
import { Mail, Loader2 } from "lucide-react";

type FormData = { email: string };

export default function ResendVerificationPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(resendVerificationSchema),
  });

  const startCooldown = () => {
    setCooldown(60);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onSubmit = async (data: FormData) => {
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        setSuccess(true);
        startCooldown();
      } else {
        setError(result.error || "Failed to send email.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md">
        <Card className="p-6 bg-white border border-zinc-200 text-zinc-900 shadow-sm">
          <CardHeader className="text-center space-y-3">
            <Mail className="mx-auto h-12 w-12 text-zinc-900" />
            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Resend Verification</CardTitle>
            <CardDescription className="text-zinc-500 text-sm">
              Enter your email address and we&apos;ll send you a new verification link.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {success && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 font-medium">
                Verification email sent! Check your inbox.
              </div>
            )}

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

            <Button
              type="submit"
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium disabled:opacity-50"
              disabled={isSubmitting || cooldown > 0}
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Sending...</>
              ) : cooldown > 0 ? (
                `Resend in ${cooldown}s`
              ) : (
                "Send Verification Email"
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
