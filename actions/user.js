"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  // 1️⃣ Check for existing insight OUTSIDE transaction
  let industryInsight = await db.industryInsight.findUnique({
    where: { industry: data.industry },
  });

  // 2️⃣ Generate AI insights OUTSIDE transaction (CRITICAL FIX)
  let insights = null;
  if (!industryInsight) {
    insights = await generateAIInsights(data.industry);
  }

  try {
    const result = await db.$transaction(async (tx) => {
      // 3️⃣ Create insight ONLY if missing
      if (!industryInsight) {
        industryInsight = await tx.industryInsight.create({
          data: {
            industry: data.industry,
            ...insights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }

      // 4️⃣ Update user
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          industry: data.industry,
          experience: data.experience,
          bio: data.bio,
          skills: data.skills,
        },
      });

      return { updatedUser, industryInsight };
    });

    revalidatePath("/");
    return result.updatedUser;
  } catch (error) {
    console.error("Error updating user and industry:", error);
    throw error;
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { industry: true },
    });

    if (!user) throw new Error("User not found");

    return {
      isOnboarded: Boolean(user.industry),
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw error;
  }
}
