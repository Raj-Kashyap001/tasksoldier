import { db } from "@/lib/prisma";
import { generateSessionToken } from "../utils";
import { cookies } from "next/headers";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

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

export async function expireSessionCookie() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  cookieStore.set("session", "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 0, // Immediately expire
    secure: process.env.NODE_ENV === "production",
  });
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (sessionToken) {
    await db.session.delete({
      where: { id: sessionToken },
    });

    expireSessionCookie();
    return true;
  }
  return false;
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return null;

  const session = await db.session.findUnique({
    where: { id: sessionToken },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          bio: true,
          onboarded: true,
          profilePictureUrl: true,
          currentWorkspaceId: true,
          currentWorkspace: {
            select: {
              id: true,
              name: true,
            },
          },
          workspaces: {
            select: {
              id: true,
              role: true,
              workspace: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) return null;

  return session.user;
}
