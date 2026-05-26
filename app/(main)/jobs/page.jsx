import { getJobListings } from "@/actions/jobs";
import JobsView from "./_components/jobs-view";
import { Briefcase } from "lucide-react";

export const metadata = {
  title: "Job Listings | Career Guidance",
};

export default async function JobsPage() {
  let data = null;
  let error = null;

  try {
    data = await getJobListings();
  } catch (err) {
    error = err.message;
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-center">
          <Briefcase className="h-10 w-10 text-destructive mx-auto mb-3" />
          <p className="text-destructive font-semibold text-lg">{error}</p>
          {error.includes("target role") && (
            <p className="text-muted-foreground text-sm mt-2">
              Go to your profile settings to complete your onboarding.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <JobsView jobs={data.jobs} profile={data.profile} />
    </div>
  );
}
