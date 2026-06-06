"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};
export default async function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const response = await fetch("/api/auth/me", {
    method: "GET",
  });

  if (!response.ok) {
    // Not logged in, redirect to login page
    router.push("/login");
    return null;
  }

  const data = await response.json();
  setUser(data.user);

  async function handleClick() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // Redirect login
      router.push("/login");

      // Refresh app state
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className=" bg-amber-200 h-screen flex justify-center items-center">
      <div className="bg-amber-600 border rounded-lg p-10 ">
        <h1 className="text-xl font-bold "> Protected Dashboard</h1>
        <h1>hello this is the dashboard route</h1>
        <h3>welcome back</h3>
        <Button onClick={handleClick} variant={"default"}>
          Logout
        </Button>
        {user && (
          <div>
            <h2 className="text-lg font-semibold mt-4">User Info:</h2>
            <p>
              <strong>Name:</strong> {user.firstName} {user.lastName}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
