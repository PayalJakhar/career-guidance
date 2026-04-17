import { Brain, Target, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function StatsCards({ assessments }) {
  const getAverageScore = () => {
    if (!assessments?.length) return 0;
    const total = assessments.reduce((sum, a) => sum + a.quizScore, 0);
    return (total / assessments.length).toFixed(1);
  };

  const getLatestScore = () => {
    if (!assessments?.length) return null;
    return assessments[0].quizScore.toFixed(1);
  };

  const getTotalQuestions = () => {
    if (!assessments?.length) return 0;
    return assessments.reduce((sum, a) => sum + a.questions.length, 0);
  };

  const avg = parseFloat(getAverageScore());
  const avgColor =
    avg >= 80
      ? "text-emerald-500"
      : avg >= 60
      ? "text-amber-500"
      : "text-red-500";
  const avgBorder =
    avg >= 80
      ? "border-l-emerald-500"
      : avg >= 60
      ? "border-l-amber-500"
      : "border-l-red-500";

  const latestScore = getLatestScore();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Average Score */}
      <div
        className={`rounded-2xl border-2 border-border border-l-4 ${avgBorder} bg-card p-6 flex flex-col`}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Average Score
          </p>
          <Trophy className={`h-5 w-5 ${avgColor}`} />
        </div>
        <p className={`text-7xl font-black leading-none ${avgColor}`}>
          {getAverageScore()}
          <span className="text-3xl font-bold">%</span>
        </p>
        <Progress value={avg} className="mt-5 h-1.5" />
        <p className="text-xs text-muted-foreground mt-2">
          Across {assessments?.length || 0} assessments
        </p>
      </div>

      {/* Questions Done */}
      <div className="rounded-2xl border-2 border-border border-l-4 border-l-blue-500 bg-card p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Questions Done
          </p>
          <Brain className="h-5 w-5 text-blue-500" />
        </div>
        <p className="text-7xl font-black leading-none text-blue-500">
          {getTotalQuestions()}
        </p>
        <p className="text-xs text-muted-foreground mt-5">
          Total questions practiced
        </p>
      </div>

      {/* Latest Score */}
      <div className="rounded-2xl border-2 border-border border-l-4 border-l-violet-500 bg-card p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Latest Score
          </p>
          <Target className="h-5 w-5 text-violet-500" />
        </div>
        <p className="text-7xl font-black leading-none text-violet-500">
          {latestScore ?? "—"}
          {latestScore && <span className="text-3xl font-bold">%</span>}
        </p>
        <p className="text-xs text-muted-foreground mt-5">Most recent quiz</p>
      </div>
    </div>
  );
}
