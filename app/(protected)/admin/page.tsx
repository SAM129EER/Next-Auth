"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ShieldCheck, MailCheck, Mail, Loader2, Users, ArrowLeft } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  verified: boolean;
  createdAt: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users");
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (response.status === 403) {
          router.push("/dashboard");
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data.users);
      } catch {
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 text-zinc-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-zinc-50 text-zinc-900">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-zinc-900">
              <Users className="h-6 w-6 text-zinc-900" />
              Admin Panel
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Manage all registered users ({users.length} total)
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-medium px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        <ClientOnly
          fallback={
            <div className="flex items-center justify-center p-8 bg-white border border-zinc-200 rounded-2xl shadow-sm">
              <Loader2 className="h-8 w-8 text-zinc-900 animate-spin" />
            </div>
          }
        >
          {/* Desktop Table */}
          <div className="hidden sm:block bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/50">
                    <th className="text-left p-4 text-sm font-semibold text-zinc-500">Name</th>
                    <th className="text-left p-4 text-sm font-semibold text-zinc-500">Email</th>
                    <th className="text-left p-4 text-sm font-semibold text-zinc-500">Role</th>
                    <th className="text-left p-4 text-sm font-semibold text-zinc-500">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-zinc-500">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-zinc-200 last:border-0 hover:bg-zinc-50/30 transition-colors">
                      <td className="p-4 text-sm font-semibold text-zinc-900">{user.firstName} {user.lastName}</td>
                      <td className="p-4 text-sm text-zinc-500">{user.email}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          user.role === "ADMIN"
                            ? "bg-purple-50 border border-purple-200 text-purple-700"
                            : "bg-blue-50 border border-blue-200 text-blue-700"
                        }`}>
                          {user.role === "ADMIN" ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {user.verified ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                            <MailCheck className="h-3 w-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-650 font-semibold">
                            <Mail className="h-3 w-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-zinc-500 font-medium">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {users.map((user) => (
              <div key={user.id} className="p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-zinc-900">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 break-all">{user.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      user.role === "ADMIN"
                        ? "bg-purple-50 border border-purple-200 text-purple-700"
                        : "bg-blue-50 border border-blue-200 text-blue-700"
                    }`}>
                      {user.role === "ADMIN" ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                      {user.role}
                    </span>
                    {user.verified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                        <MailCheck className="h-3 w-3" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-semibold">
                        <Mail className="h-3 w-3" /> Pending
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 border-t border-zinc-100 pt-2 font-medium">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </ClientOnly>
      </div>
    </div>
  );
}
