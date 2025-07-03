import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { hash, compare } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function hashPassword(password: string) {
  return await hash(password, 10);
}

export async function comparePassword(password: string, hashed: string) {
  return await compare(password, hashed);
}

export function generateSessionToken(): string {
  return uuidv4();
}
