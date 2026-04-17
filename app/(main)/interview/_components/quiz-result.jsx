"use client";

import { Trophy, CheckCircle2, XCircle, RotateCcw, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function QuizResult({
  result,
  hideStartNew = false,
  onStartNew,
}) {
  if (!result) return null;

  const score = result.quizScore;
  const correct = result.questions.filter((q) => q.isCorrect).length;
  const wrong = result.questions.length - correct;

  const scoreColor =
    score >= 80
      ? "text-emerald-500"
      : score >= 60
      ? "text-amber-500"
      : "text-red-500";
  const scorePanelBorder =
    score >= 80
      ? "border-emerald-500/30"
      : score >= 60
      ? "border-amber-500/30"
      : "border-red-500/30";
  const scorePanelBg =
    score >= 80
      ? "bg-emerald-500/5"
      : score >= 60
      ? "bg-amber-500/5"
      : "bg-red-500/5";
  const scoreLabel =
    score >= 80 ? "Excellent!" : score >= 60 ? "Good Job!" : "Keep Practicing";

  return (
    <div className="space-y-5">
      {/* Score hero panel */}
      <div
        className={`rounded-2xl border-2 ${scorePanelBorder} ${scorePanelBg} p-8 text-center`}
      >
        <Trophy className={`h-10 w-10 mx-auto mb-3 ${scoreColor}`} />
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          {scoreLabel}
        </p>
        <p className={`text-8xl font-black leading-none ${scoreColor}`}>
          {score.toFixed(0)}
          <span className="text-4xl">%</span>
        </p>
        <Progress value={score} className="mt-6 h-2 max-w-xs mx-auto" />

        {/* Correct / Wrong / Total */}
        <div className="flex justify-center gap-8 mt-6">
          <div className="text-center">
            <p className="text-3xl font-black text-emerald-500">{correct}</p>
            <p className="text-xs text-muted-foreground mt-1">Correct</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-3xl font-black text-red-500">{wrong}</p>
            <p className="text-xs text-muted-foreground mt-1">Wrong</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-3xl font-black">{result.questions.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total</p>
          </div>
        </div>
      </div>

      {/* Improvement tip */}
      {result.improvementTip && (
        <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
            <Lightbulb className="h-4 w-4" />
            Improvement Tip
          </div>
          <p className="text-sm leading-relaxed">{result.improvementTip}</p>
        </div>
      )}

      {/* Question review */}
      <div>
        <h3 className="text-lg font-bold mb-4">Question Review</h3>
        <div className="space-y-3">
          {result.questions.map((q, index) => (
            <div
              key={index}
              className={`rounded-xl border-2 p-4 ${
                q.isCorrect
                  ? "border-emerald-500/25 bg-emerald-500/5"
                  : "border-red-500/25 bg-red-500/5"
              }`}
            >
              <div className="flex items-start gap-3">
                {q.isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{q.question}</p>
                  <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
                    <p>
                      Your answer:{" "}
                      <span
                        className={`font-medium ${
                          q.isCorrect
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {q.userAnswer}
                      </span>
                    </p>
                    {!q.isCorrect && (
                      <p>
                        Correct answer:{" "}
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {q.answer}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/70">
                      Explanation:{" "}
                    </span>
                    {q.explanation}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!hideStartNew && (
        <Button onClick={onStartNew} className="w-full gap-2" size="lg">
          <RotateCcw className="h-4 w-4" />
          Start New Quiz
        </Button>
      )}
    </div>
  );
}
