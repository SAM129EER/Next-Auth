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

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

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

  const onSubmit = async (data: SignupData) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          firstName: data.first,
          lastName: data.last,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      console.log(result);

      router.push("/login");
    } catch (error: any) {
      console.error(error);

      alert(error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md"
      >
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Create Account
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            
            {/* First + Last Name */}
            <FieldGroup className="grid grid-cols-2 gap-3">
              
              <Field>
                <FieldLabel>First Name</FieldLabel>

                <Input
                  placeholder="First Name"
                  {...register("first")}
                />

                {errors.first && (
                  <FieldError>
                    {errors.first.message}
                  </FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel>Last Name</FieldLabel>

                <Input
                  placeholder="Last Name"
                  {...register("last")}
                />

                {errors.last && (
                  <FieldError>
                    {errors.last.message}
                  </FieldError>
                )}
              </Field>

            </FieldGroup>

            {/* Email */}
            <Field>
              <FieldLabel>Email</FieldLabel>

              <Input
                type="email"
                placeholder="Enter your email"
                {...register("email")}
              />

              {errors.email && (
                <FieldError>
                  {errors.email.message}
                </FieldError>
              )}
            </Field>

            {/* Password */}
            <Field>
              <FieldLabel>Password</FieldLabel>

              <div className="flex gap-2">
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Enter password"
                  {...register("password")}
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShow(!show)}
                >
                  {show ? "Hide" : "Show"}
                </Button>
              </div>

              {errors.password && (
                <FieldError>
                  {errors.password.message}
                </FieldError>
              )}
            </Field>

            {/* Confirm Password */}
            <Field>
              <FieldLabel>Confirm Password</FieldLabel>

              <Input
                type={show ? "text" : "password"}
                placeholder="Confirm password"
                {...register("confirmPassword")}
              />

              {errors.confirmPassword && (
                <FieldError>
                  {errors.confirmPassword.message}
                </FieldError>
              )}
            </Field>

            {/* Submit */}
            <Button
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Sign Up"}
            </Button>
          </CardContent>

          <CardFooter className="justify-center text-sm">
            Already have an account?
            
            <Link
              href="/login"
              className="ml-1 text-blue-500 hover:underline"
            >
              Login
            </Link>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}