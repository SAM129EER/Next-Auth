"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.push("/login");
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white border rounded-2xl shadow-md p-10 w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Protected Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, {user.firstName}!
          </p>
        </div>

        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Name</span>
            <span>
              {user.firstName} {user.lastName}
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Role</span>
            <span className="capitalize lowercase">{user.role}</span>
          </div>
        </div>

        <Button onClick={handleLogout} variant="destructive" className="w-full">
          Logout
        </Button>
      </div>
    </div>
  );
}
