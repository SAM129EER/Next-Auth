import { prisma } from "@/lib/db/prisma";
import { verifyAccessToken } from "./tokens";
import { getAccessTokenFromCookies } from "./cookies";

export async function getCurrentUser() {
  const token = await getAccessTokenFromCookies();

  if (!token) {
    return null;
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      verified: true,
      createdAt: true,
    },
  });

  if (!user) {
    return null;
  }

  return user;
}
