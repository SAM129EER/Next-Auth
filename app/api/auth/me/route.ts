import { getCurrentUser } from "@/lib/currentUser";

export async function GET() {
  const user = await getCurrentUser();

  // Not logged in
  if (!user) {
    return Response.json(
      {
        error: "Unauthorized",
      },
      { status: 401 },
    );
  }

  return Response.json({
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
}
