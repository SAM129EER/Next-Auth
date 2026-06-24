"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

const navLinks = [
  { id: 1, name: "Home", href: "/" },
  { id: 2, name: "Dashboard", href: "/dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [pathname]); // Re-check on every route change

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="flex items-center justify-between">
      {/* Left: Brand + Nav Links */}
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          🔐 AuthNext
        </Link>
        <div className="hidden sm:flex items-center gap-4 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={`transition-colors hover:text-black ${
                pathname === link.href
                  ? "font-semibold text-black border-b-2 border-black pb-0.5"
                  : "text-gray-500"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Right: Auth Controls */}
      <div className="flex items-center gap-3">
        {loading ? (
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
        ) : user ? (
          <>
            <span className="text-sm text-gray-600 hidden sm:block">
              Hi,{" "}
              <span className="font-medium text-black">{user.firstName}</span>
            </span>
            <Button size="sm" variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button size="sm" variant="ghost">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
