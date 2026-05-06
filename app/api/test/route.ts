import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
export async function GET() {
  const hashed = await hashPassword("password123");
  const users = await prisma.user.findMany();

  return Response.json({
    users,
    hashed,
  });
}
