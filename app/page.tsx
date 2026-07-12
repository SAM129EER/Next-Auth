"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginCard from "@/components/LoginCard";
import SignupCard from "@/components/SignupCard";
import ClientOnly from "@/components/ClientOnly";
import { Loader2 } from "lucide-react";

type User = {
  id: string;
  firstName: string;
};

export default function Home() {
  const [modal, setModal] = useState<"login" | "signup" | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-900 px-4 relative">
      {/* Home Container */}
      <div className="text-center space-y-6 max-w-md w-full p-8 bg-white border border-zinc-200 rounded-2xl shadow-sm">
        <div className="space-y-3">
          <div className="text-5xl select-none">🔐</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">AuthNext</h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            A clean, secure, and production-grade authentication template.
          </p>
        </div>

        {/* Dynamic Client Actions */}
        <ClientOnly
          fallback={
            <div className="flex justify-center py-2">
              <Loader2 className="h-6 w-6 text-zinc-900 animate-spin" />
            </div>
          }
        >
          {loading ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-6 w-6 text-zinc-900 animate-spin" />
            </div>
          ) : user ? (
            <div className="space-y-4">
              <p className="text-sm text-zinc-650">
                Welcome back, <span className="font-semibold text-zinc-900">{user.firstName}</span>!
              </p>
              <button
                onClick={() => {
                  router.push("/dashboard");
                  router.refresh();
                }}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2 rounded-lg text-sm shadow-sm transition-colors cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setModal("login")}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2 rounded-lg text-sm shadow-sm transition-colors cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => setModal("signup")}
                className="w-full bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-medium py-2 rounded-lg text-sm shadow-sm transition-colors cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}
        </ClientOnly>
      </div>

      {/* Modal Overlays (Client-Only) */}
      <ClientOnly>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
              {modal === "login" ? (
                <LoginCard
                  onClose={() => setModal(null)}
                  onSwitchToSignup={() => setModal("signup")}
                />
              ) : (
                <SignupCard
                  onClose={() => setModal(null)}
                  onSwitchToLogin={() => setModal("login")}
                />
              )}
            </div>
          </div>
        )}
      </ClientOnly>
    </main>
  );
}