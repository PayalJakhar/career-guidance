import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_component/dashboard-view";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export default async function DashboardPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const insights = await getIndustryInsights();

  const { userId } = await auth();
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { pipelineInsight: true, pipelineRanAt: true, targetRole: true },
  });

  return (
    <div className="container mx-auto">
      <DashboardView
        insights={insights}
        pipelineInsight={user?.pipelineInsight ?? null}
        pipelineRanAt={user?.pipelineRanAt ?? null}
        targetRole={user?.targetRole ?? null}
      />
    </div>
  );
}
