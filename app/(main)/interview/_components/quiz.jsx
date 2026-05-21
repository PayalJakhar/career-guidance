"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateQuiz, saveQuizResult } from "@/actions/interview";
import QuizResult from "./quiz-result";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";
import { ChevronRight, HelpCircle, Lightbulb, PlayCircle } from "lucide-react";

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
  } = useFetch(generateQuiz);

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,
  } = useFetch(saveQuizResult);

  useEffect(() => {
    if (quizData) setAnswers(new Array(quizData.length).fill(null));
  }, [quizData]);

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
    setShowExplanation(false);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === quizData[index].correctAnswer) correct++;
    });
    return (correct / quizData.length) * 100;
  };

  const finishQuiz = async () => {
    const score = calculateScore();
    try {
      await saveQuizResultFn(quizData, answers, score);
      toast.success("Quiz completed!");
    } catch (error) {
      toast.error(error.message || "Failed to save quiz results");
    }
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    generateQuizFn();
    setResultData(null);
  };

  /* ── Loading ── */
  if (generatingQuiz) {
    return (
      <div className="mx-2 rounded-2xl border-2 border-border bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Generating your personalised quiz...
        </p>
        <BarLoader width={"100%"} color="hsl(var(--primary))" />
      </div>
    );
  }

  /* ── Results ── */
  if (resultData) {
    return (
      <div className="mx-2">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />
      </div>
    );
  }

  /* ── Start screen ── */
  if (!quizData) {
    return (
      <div className="mx-2 rounded-2xl border-2 border-border bg-card overflow-hidden">
        <div
          className="p-10 text-white text-center"
          style={{
            background:
              "linear-gradient(135deg, hsl(185,41%,22%) 0%, hsl(185,36%,38%) 100%)",
          }}
        >
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/10 border border-white/20 mb-5">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-black mb-2">Ready to Test Yourself?</h2>
          <p className="text-sm opacity-75 max-w-sm mx-auto">
            10 questions tailored to your industry and skills. No time limit —
            take your time.
          </p>
        </div>
        <div className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30">
          <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
            <span>✦ 10 questions</span>
            <span>✦ Industry-specific</span>
            <span>✦ With explanations</span>
          </div>
          <Button
            onClick={generateQuizFn}
            size="lg"
            className="gap-2 w-full sm:w-auto"
          >
            <PlayCircle className="h-5 w-5" />
            Start Quiz
          </Button>
        </div>
      </div>
    );
  }

  /* ── Quiz in progress ── */
  const question = quizData[currentQuestion];
  const progress = (currentQuestion / quizData.length) * 100;

  return (
    <div className="mx-2 rounded-2xl border-2 border-border bg-card overflow-hidden">
      {/* Top progress bar */}
      <div className="h-1.5 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question counter + dot strip */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <span className="text-sm font-semibold text-muted-foreground">
          Question{" "}
          <span className="text-foreground font-black">
            {currentQuestion + 1}
          </span>{" "}
          / {quizData.length}
        </span>
        <div className="flex gap-1">
          {quizData.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-4 rounded-full transition-colors ${
                i < currentQuestion
                  ? "bg-primary"
                  : i === currentQuestion
                  ? "bg-primary/50"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question text */}
      <div className="px-6 pt-8 pb-6">
        <p className="text-xl font-bold leading-snug">{question.question}</p>
      </div>

      {/* Answer tiles */}
      <div className="px-6 pb-6 grid grid-cols-1 gap-3">
        {question.options.map((option, index) => {
          const isSelected = answers[currentQuestion] === option;
          return (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className={`w-full text-left rounded-xl border-2 px-5 py-4 text-sm font-medium transition-all ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:border-primary/40 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`shrink-0 flex items-center justify-center h-6 w-6 rounded-full border-2 text-xs font-black transition-colors ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation panel */}
      {showExplanation && (
        <div className="mx-6 mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-2">
            <Lightbulb className="h-4 w-4" />
            Explanation
          </div>
          <p className="text-sm leading-relaxed text-foreground/80">
            {question.explanation}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
        {!showExplanation ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExplanation(true)}
            disabled={!answers[currentQuestion]}
            className="gap-1.5"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            Show Explanation
          </Button>
        ) : (
          <div />
        )}
        <Button
          onClick={handleNext}
          disabled={!answers[currentQuestion] || savingResult}
          className="gap-2"
        >
          {savingResult ? (
            <BarLoader width={60} color="white" />
          ) : (
            <>
              {currentQuestion < quizData.length - 1
                ? "Next Question"
                : "Finish Quiz"}
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
