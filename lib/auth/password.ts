import bcrypt from "bcrypt";

const SALT_ROUNDS = 10; // Match what was originally there or 10 is fine (previously 10 in bcrypt.hash(password, 10))

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
