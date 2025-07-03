import { db } from "@/lib/prisma";
import { generateSessionToken } from "../utils";
import { cookies } from "next/headers";

export async function createSession(userId: string) {
  const token = generateSessionToken();
  const cookieStore = await cookies();
  await db.session.create({
    data: {
      id: token,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    },
  });

  cookieStore.set("session", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });

  return token;
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return null;

  const session = await db.session.findUnique({
    where: { id: sessionToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;

  return session.user;
}
