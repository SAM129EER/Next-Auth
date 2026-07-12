import { NextResponse } from "next/server";
import { getRefreshTokenFromCookies, clearAuthCookies } from "@/lib/auth/cookies";
import { prisma } from "@/lib/db/prisma";

export async function POST() {
  try {
    const refreshToken = await getRefreshTokenFromCookies();

    if (refreshToken) {
      // Invalidate token in database
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    // Clear authentication cookies
    await clearAuthCookies();

    return NextResponse.json({
      message: "Logout successful",
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    // Clear cookies anyway on error
    await clearAuthCookies();
    return NextResponse.json(
      { error: "Something went wrong during logout" },
      { status: 500 }
    );
  }
}
