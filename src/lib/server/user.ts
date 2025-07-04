import { db } from "@/lib/prisma";

interface UpdateUserInput {
  fullName?: string;
  profilePictureUrl?: string;
  bio?: string;
}

export async function updateUser(userId: string, data: UpdateUserInput) {
  return await db.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      fullName: true,
      email: true,
      bio: true,
      profilePictureUrl: true,
      updatedAt: true,
    },
  });
}
