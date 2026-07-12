"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ShieldCheck, MailCheck, Mail, Loader2, LogOut, ArrowRight } from "lucide-react";
import Link from "next/link";
import ClientOnly from "@/components/ClientOnly";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  verified: boolean;
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
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 text-zinc-900 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-8">
      <ClientOnly
        fallback={
          <div className="flex items-center justify-center w-full max-w-md p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm">
            <Loader2 className="h-8 w-8 text-zinc-900 animate-spin" />
          </div>
        }
      >
        <div className="w-full max-w-md p-6 bg-white border border-zinc-200 rounded-2xl text-zinc-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">Dashboard</h2>
              <p className="text-zinc-550 text-xs mt-0.5">Welcome back, {user.firstName}!</p>
            </div>
            <div className="flex gap-1.5 flex-wrap justify-end">
              {user.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-emerald-700">
                  <MailCheck className="h-3 w-3" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-amber-700">
                  <Mail className="h-3 w-3" /> Unverified
                </span>
              )}
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-semibold ${
                user.role === "ADMIN"
                  ? "bg-purple-55 border border-purple-200 text-purple-700"
                  : "bg-blue-50 border border-blue-200 text-blue-700"
              }`}>
                {user.role === "ADMIN" ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                {user.role}
              </span>
            </div>
          </div>

          <hr className="border-zinc-100" />

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500 font-medium">Name</span>
              <span className="font-semibold text-zinc-900">{user.firstName} {user.lastName}</span>
            </div>
            <div className="flex justify-between items-center text-sm gap-4">
              <span className="text-zinc-500 font-medium">Email</span>
              <span className="font-semibold text-zinc-900 text-right break-all">{user.email}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500 font-medium">Role</span>
              <span className="font-semibold text-zinc-900 capitalize">{user.role.toLowerCase()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500 font-medium">Status</span>
              <span className="font-semibold text-zinc-900">{user.verified ? "Verified" : "Pending Verification"}</span>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            {user.role === "ADMIN" && (
              <button
                onClick={() => router.push("/admin")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center cursor-pointer"
              >
                <ShieldCheck className="mr-2 h-4 w-4" /> Go to Admin Panel <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </ClientOnly>
    </div>
  );
}
