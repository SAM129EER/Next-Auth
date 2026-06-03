import { prisma } from "@/lib/db";
import { comparePassword } from "@/lib/password";
import { generateToken } from "@/lib/jwtToken";
import { loginSchema } from "@/lib/zodSchema";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    const { email, password } = validatedData;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json(
        {
          error: "Invalid credentials",
        },
        { status: 401 },
      );
    }

    // Compare password
    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      return Response.json(
        {
          error: "Invalid credentials",
        },
        { status: 401 },
      );
    }

    // Generate JWT
    const token = generateToken(user.id);

    // Store in cookie
    const cookieStore = await cookies();

    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return Response.json({
      message: "Login successful",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error: any) {
    return Response.json(
      {
        error: error?.message || "Something went wrong",
      },
      { status: 500 },
    );
  }
}
