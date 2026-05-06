"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/zodSchema";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

type LoginData = {
  email: string;
  password: string;
};

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });
  const router = useRouter();

 const onSubmit = async (
  data: LoginData
) => {
  try {
    const response = await fetch(
      "/api/auth/login",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          data
        ),
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.error
      );
    }

    console.log(result);

    // Redirect after login
    router.push(
      "/dashboard"
    );
  } catch (error: any) {
    console.error(error);

    alert(error.message);
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md">
        <Card className="p-6 space-y-4">
          <CardHeader>
            <CardTitle className="text-center text-xl">Login</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Input type="email" placeholder="Email" {...register("email")} />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Input
                type="password"
                placeholder="Password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </CardContent>

          <CardFooter className="text-sm text-center justify-center">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-blue-500 ml-1">
              Sign up
            </Link>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
