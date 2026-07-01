import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, name: true, role: true, password: true },
  });
  console.log("Users in database:", users.length);
  for (const u of users) {
    const match = u.password ? await compare("password123", u.password) : false;
    console.log(`${u.email} | ${u.name} | ${u.role} | password check: ${match}`);
  }
  await prisma.$disconnect();
}

main();
