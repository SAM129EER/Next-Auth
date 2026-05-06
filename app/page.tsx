import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center space-y-6 bg-white p-10 rounded-2xl shadow-lg">
        
        <h1 className="text-2xl font-bold">
          Welcome 👋
        </h1>

        <p className="text-gray-600">
          You need to login or signup to continue
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button>Login</Button>
          </Link>

          <Link href="/signup">
            <Button variant="outline">Sign Up</Button>
          </Link>
        </div>

      </div>
    </main>
  );
}