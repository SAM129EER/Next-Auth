import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-57px)] items-center justify-center ">
      <div className="text-center space-y-6 bg-white px-12 py-14 rounded-2xl shadow-md max-w-md w-full">
        <div className="space-y-2">
          <div className="text-4xl">🔐</div>
          <h1 className="text-3xl font-bold tracking-tight">AuthNext</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            A full-stack authentication system built with Next.js, Prisma,
            bcrypt, and JWT cookies.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/login">
            <Button className="px-6">Login</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" className="px-6">
              Sign Up
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-400">
          Go to{" "}
          <Link href="/dashboard" className="underline hover:text-gray-600">
            Dashboard
          </Link>{" "}
          if you&apos;re already logged in.
        </p>
      </div>
    </main>
  );
}