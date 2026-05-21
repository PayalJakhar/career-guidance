"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QuizResult from "./quiz-result";
import { ChevronRight, PlayCircle, Clock, BarChart2 } from "lucide-react";

function ScoreBadge({ score }) {
  const label = score.toFixed(1) + "%";
  if (score >= 80)
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 shrink-0">
        {label}
      </span>
    );
  if (score >= 60)
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 shrink-0">
        {label}
      </span>
    );
  return (
    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 shrink-0">
      {label}
    </span>
  );
}

export default function QuizList({ assessments }) {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  return (
    <>
      <div className="rounded-2xl border-2 border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-bold">Recent Quizzes</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Click any row to review your answers
            </p>
          </div>
          <Button
            onClick={() => router.push("/interview/mock")}
            className="gap-2"
          >
            <PlayCircle className="h-4 w-4" />
            Start New Quiz
          </Button>
        </div>

        {/* Empty state */}
        {!assessments?.length ? (
          <div className="p-16 text-center text-muted-foreground">
            <BarChart2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No quizzes yet</p>
            <p className="text-sm mt-1">
              Start your first quiz to see results here
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {assessments.map((assessment, i) => (
              <div
                key={assessment.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 cursor-pointer transition-colors group"
                onClick={() => setSelectedQuiz(assessment)}
              >
                {/* Index circle */}
                <span className="shrink-0 flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary text-sm font-black">
                  {i + 1}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Quiz #{i + 1}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(
                      new Date(assessment.createdAt),
                      "MMM dd, yyyy · HH:mm"
                    )}
                  </div>
                  {assessment.improvementTip && (
                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-md">
                      {assessment.improvementTip}
                    </p>
                  )}
                </div>

                <ScoreBadge score={assessment.quizScore} />

                <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <QuizResult
            result={selectedQuiz}
            hideStartNew
            onStartNew={() => router.push("/interview/mock")}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
