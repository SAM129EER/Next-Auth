import { hashPassword } from "@/lib/password";
import { signupSchema } from "@/lib/zodSchema";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = signupSchema.parse(body);
    const { first, last, email, password } = validatedData;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        firstName: first,
        lastName: last,
        email,
        password: hashedPassword,
      },
    });
    return Response.json(
      {
        message: "User created successfully",
        user: {
          id: newUser.id,
          first: newUser.firstName,
          last: newUser.lastName,
          email: newUser.email,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
