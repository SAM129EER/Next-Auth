import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing users
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      firstName: "System",
      lastName: "Admin",
      email: "admin@example.com",
      password: passwordHash,
      role: "ADMIN",
      verified: true,
    },
  });

  // Create Standard User
  const user = await prisma.user.create({
    data: {
      firstName: "Jane",
      lastName: "Doe",
      email: "user@example.com",
      password: passwordHash,
      role: "USER",
      verified: true,
    },
  });

  console.log("Database seeded successfully!");
  console.log("Admin user:", admin.email);
  console.log("Regular user:", user.email);
  console.log("Password for both: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
