import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { courseId } = await request.json();
    if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await db.courseInteraction.create({
      data: { userId: user.id, courseId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
