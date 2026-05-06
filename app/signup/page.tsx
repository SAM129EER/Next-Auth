"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { signupSchema } from "@/lib/zodSchema";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

type SignupData = z.infer<typeof signupSchema>;

export default function Signup() {
  const [show, setShow] = useState(false);
const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
  });

 const onSubmit = async (
  data: SignupData
) => {
  try {
    const response = await fetch(
      "/api/auth/signup",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          firstName: data.first,
          lastName: data.last,
          email: data.email,
          password: data.password,
          confirmPassword:
            data.confirmPassword,
        }),
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
  router.push("/login");
  
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
            <CardTitle className="text-center text-xl">
              Create Account
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="w-full">
                <Input placeholder="First Name" {...register("first")} />
                {errors.first && (
                  <p className="text-red-500 text-sm">{errors.first.message}</p>
                )}
              </div>

              <div className="w-full">
                <Input placeholder="Last Name" {...register("last")} />
                {errors.last && (
                  <p className="text-red-500 text-sm">{errors.last.message}</p>
                )}
              </div>
            </div>

            <Input type="email" placeholder="Email" {...register("email")} />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}

            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Password"
                  {...register("password")}
                />
                <Button type="button" onClick={() => setShow(!show)}>
                  {show ? "Hide" : "Show"}
                </Button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}

              <Input
                type={show ? "text" : "password"}
                placeholder="Confirm Password"
                {...register("confirmPassword")}
              />

              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Sign Up"}
            </Button>
          </CardContent>

          <CardFooter className="text-sm text-center justify-center">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 ml-1">
              Login
            </Link>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
