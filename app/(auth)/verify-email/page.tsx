"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { MailCheck, MailX, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token">(
    token ? "loading" : "no-token"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <Card className="w-full max-w-md p-6 bg-white border border-zinc-200 text-zinc-900 shadow-sm">
      <CardHeader className="text-center space-y-3">
        {status === "loading" && (
          <Loader2 className="mx-auto h-12 w-12 text-zinc-900 animate-spin" />
        )}
        {status === "success" && (
          <MailCheck className="mx-auto h-12 w-12 text-zinc-900" />
        )}
        {status === "error" && (
          <MailX className="mx-auto h-12 w-12 text-red-500" />
        )}
        {status === "no-token" && (
          <MailCheck className="mx-auto h-12 w-12 text-zinc-900" />
        )}

        <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">
          {status === "loading" && "Verifying..."}
          {status === "success" && "Email Verified!"}
          {status === "error" && "Verification Failed"}
          {status === "no-token" && "Check Your Email"}
        </CardTitle>

        <CardDescription className="text-zinc-500 text-sm">
          {status === "loading" && "Please wait while we verify your email address."}
          {status === "success" && message}
          {status === "error" && message}
          {status === "no-token" &&
            "We've sent a verification link to your email. Click the link to activate your account."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {status === "success" && (
          <Button
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium"
            onClick={() => router.push("/login")}
          >
            Continue to Login
          </Button>
        )}

        {status === "error" && (
          <Button
            className="w-full bg-zinc-100 border border-zinc-200 text-zinc-900 hover:bg-zinc-200 font-medium"
            onClick={() => router.push("/resend-verification")}
          >
            Resend Verification Email
          </Button>
        )}

        {status === "no-token" && (
          <Button
            className="w-full bg-zinc-100 border border-zinc-200 text-zinc-900 hover:bg-zinc-200 font-medium"
            onClick={() => router.push("/resend-verification")}
          >
            Didn&apos;t receive it? Resend
          </Button>
        )}
      </CardContent>

      <CardFooter className="justify-center text-sm">
        <Link href="/login" className="text-zinc-900 hover:underline transition-colors font-medium">
          Back to Login
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
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
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
