import bcrypt from "bcryptjs";
import { syncUserRoles } from "@/lib/next-auth";
import { BadRequestError } from "@/lib/http-errors";
import {
  createUserRecord,
  findUserByEmailOrUsername,
} from "@/lib/repositories/user-repository";

export type RegisterUserInput = {
  username: string;
  email: string;
  password: string;
};

export async function registerUser(input: RegisterUserInput) {
  const existingUser = await findUserByEmailOrUsername(input.email, input.username);

  if (existingUser?.email === input.email) {
    throw new BadRequestError("Email sudah terdaftar.");
  }

  if (existingUser?.username === input.username) {
    throw new BadRequestError("Username tidak tersedia.");
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const createdUser = await createUserRecord({
    username: input.username,
    email: input.email,
    password: hashedPassword,
  });

  await syncUserRoles(createdUser.id, []);

  return createdUser;
}
