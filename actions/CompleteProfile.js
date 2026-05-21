"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function completeProfile({ state, city, currentRole, experience, targetRole, targetLevel }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        state,
        city,
        role: currentRole,
        experience: experience !== undefined && experience !== "" ? parseInt(experience) : null,
        targetRole,
        targetLevel,
        isOnboarded: true,
      },
    });

    revalidatePath("/");
    return updatedUser;
  } catch (error) {
    console.error("Error completing profile:", error);
    throw new Error("Failed to complete profile");
  }
}
