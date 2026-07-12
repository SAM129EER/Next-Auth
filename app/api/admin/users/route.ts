import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/db/prisma";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/constants";

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const limitResult = await rateLimit(`admin_users:${ip}`, RATE_LIMITS.ADMIN_USERS.limit, RATE_LIMITS.ADMIN_USERS.windowSeconds);
  const headers = getRateLimitHeaders(limitResult);

  if (!limitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers }
    );
  }

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403, headers }
      );
    }

    // Retrieve all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        verified: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users }, { headers });
  } catch (error: any) {
    console.error("Admin list users API error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500, headers }
    );
  }
}
