import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyToken } from "./jwtToken";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: {
      id: decoded.Id,
    },
  });
  if (!user) {
    return null;
  }
  return user;
}
