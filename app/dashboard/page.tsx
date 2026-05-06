"use client"
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  async function handleClick() {
    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Logout failed"
        );
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
        <h1 >hello this is the dashboard route</h1>
        <h3>welcome back</h3>
        <Button onClick={handleClick}  variant={"default"}>Logout</Button>
      </div>
    </div>
  );
}