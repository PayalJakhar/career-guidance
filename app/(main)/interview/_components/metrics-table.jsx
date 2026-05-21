"use client";

import { BarChart2 } from "lucide-react";
import { format } from "date-fns";

function computeMetrics(questions) {
  const total = questions.length;
  if (total === 0) return { precision: 0, recall: 0, f1: 0 };
  const tp = questions.filter((q) => q.isCorrect).length;
  const fp = total - tp;
  const fn = total - tp;
  const precision = tp / (tp + fp || 1);
  const recall = tp / (tp + fn || 1);
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  return {
    precision: Math.round(precision * 100),
    recall: Math.round(recall * 100),
    f1: Math.round(f1 * 100),
  };
}

function getUserLevel(assessments) {
  if (!assessments?.length) return "Unknown";
  const avg = assessments.reduce((s, a) => s + a.quizScore, 0) / assessments.length;
  if (avg >= 75) return "Senior / Expert";
  if (avg >= 50) return "Mid-Career";
  return "Fresher / Beginner";
}

function colorClass(val) {
  if (val >= 70) return "text-emerald-500";
  if (val >= 40) return "text-amber-500";
  return "text-red-500";
}

export default function MetricsTable({ assessments }) {
  if (!assessments?.length) return null;

  const overallMetrics = computeMetrics(
    assessments.flatMap((a) => a.questions)
  );
  const userLevel = getUserLevel(assessments);

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-6 space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <BarChart2 className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-bold">Performance Metrics (Precision / Recall / F1)</h3>
      </div>
      <p className="text-sm text-muted-foreground -mt-3">
        User profile type: <span className="font-semibold text-foreground">{userLevel}</span>
      </p>

      {/* Overall summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Precision", value: overallMetrics.precision },
          { label: "Recall", value: overallMetrics.recall },
          { label: "F1 Score", value: overallMetrics.f1 },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border bg-muted/30 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              {label}
            </p>
            <p className={`text-4xl font-black ${colorClass(value)}`}>
              {value}
              <span className="text-xl font-bold">%</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Overall</p>
          </div>
        ))}
      </div>

      {/* Per-quiz table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-muted-foreground text-xs uppercase tracking-widest">
              <th className="text-left py-2 pr-4 font-semibold">Date</th>
              <th className="text-center py-2 px-2 font-semibold">Category</th>
              <th className="text-center py-2 px-2 font-semibold">Score</th>
              <th className="text-center py-2 px-2 font-semibold">Precision</th>
              <th className="text-center py-2 px-2 font-semibold">Recall</th>
              <th className="text-center py-2 px-2 font-semibold">F1</th>
              <th className="text-center py-2 px-2 font-semibold">Correct / Total</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((a) => {
              const m = computeMetrics(a.questions);
              const correct = a.questions.filter((q) => q.isCorrect).length;
              return (
                <tr key={a.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                    {format(new Date(a.createdAt), "MMM dd, yyyy")}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {a.category}
                    </span>
                  </td>
                  <td className={`py-3 px-2 text-center font-bold ${colorClass(a.quizScore)}`}>
                    {Math.round(a.quizScore)}%
                  </td>
                  <td className={`py-3 px-2 text-center font-semibold ${colorClass(m.precision)}`}>
                    {m.precision}%
                  </td>
                  <td className={`py-3 px-2 text-center font-semibold ${colorClass(m.recall)}`}>
                    {m.recall}%
                  </td>
                  <td className={`py-3 px-2 text-center font-bold ${colorClass(m.f1)}`}>
                    {m.f1}%
                  </td>
                  <td className="py-3 px-2 text-center text-muted-foreground">
                    {correct} / {a.questions.length}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
