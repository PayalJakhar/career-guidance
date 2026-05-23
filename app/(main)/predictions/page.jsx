"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Brain, Target, TrendingUp, BarChart2, AlertCircle, Info } from "lucide-react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

function MetricCard({ label, value, suffix = "%", color = "text-primary", note }) {
  return (
    <div className="rounded-2xl border-2 border-border bg-card p-6 flex flex-col">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        {label}
      </p>
      {value === null || value === undefined ? (
        <p className="text-2xl font-bold text-muted-foreground">N/A</p>
      ) : (
        <p className={`text-5xl font-black leading-none ${color}`}>
          {value}
          <span className="text-2xl font-bold">{suffix}</span>
        </p>
      )}
      {note && <p className="text-xs text-muted-foreground mt-3">{note}</p>}
    </div>
  );
}

function colorFor(val) {
  if (val === null || val === undefined) return "text-muted-foreground";
  if (val >= 70) return "text-emerald-500";
  if (val >= 40) return "text-amber-500";
  return "text-red-500";
}

export default function PredictionsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/predictions")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Computing predictions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { skillGapAccuracy, recommendationAccuracy } = data;
  const { predictedMatch, actualMatch, mae, matchedRole, featureContributions, timeline } = skillGapAccuracy;

  const featureBarData = [
    { feature: "Quiz Performance", value: featureContributions.quizPerformance, weight: "50%" },
    { feature: "Skills Coverage", value: featureContributions.skillsCoverage, weight: "30%" },
    { feature: "Experience", value: featureContributions.experienceFactor, weight: "20%" },
  ];

  const timelineChartData = timeline.map((t) => ({
    date: format(new Date(t.date), "MMM dd"),
    "Quiz Score": t.quizScore,
    "Predicted Match": t.predictedMatch,
  }));

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-5xl md:text-6xl font-bold gradient-title mb-2">
          Predictive Analytics
        </h1>
        <p className="text-muted-foreground">
          Model-based predictions vs. actual outcomes for your career profile.
        </p>
      </div>

      {/* ── SECTION 1: Skill Gap Accuracy ── */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Skill Gap Accuracy</h2>
        </div>

        {matchedRole ? (
          <>
            <p className="text-sm text-muted-foreground -mt-2">
              Predicting skill match for{" "}
              <span className="font-semibold text-foreground capitalize">{matchedRole}</span> using
              quiz scores, skills coverage, and experience.
            </p>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard
                label="Predicted Match"
                value={predictedMatch}
                color={colorFor(predictedMatch)}
                note="From quiz avg + skills + experience"
              />
              <MetricCard
                label="Actual Match"
                value={actualMatch}
                color={colorFor(actualMatch)}
                note="Rule-based cosine similarity score"
              />
              <MetricCard
                label="Mean Abs. Error"
                value={mae}
                color={mae <= 10 ? "text-emerald-500" : mae <= 25 ? "text-amber-500" : "text-red-500"}
                note={mae <= 10 ? "Excellent prediction accuracy" : mae <= 25 ? "Moderate accuracy" : "High prediction error"}
              />
            </div>

            {/* Feature contributions */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  Feature Contributions to Predicted Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={featureBarData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="feature" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                      <Tooltip
                        content={({ active, payload }) =>
                          active && payload?.length ? (
                            <div className="bg-background border rounded-xl p-3 shadow text-sm">
                              <p className="font-semibold">{payload[0].payload.feature}</p>
                              <p className="text-muted-foreground text-xs">Weight: {payload[0].payload.weight}</p>
                              <p className="font-bold text-primary">{payload[0].value}%</p>
                            </div>
                          ) : null
                        }
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg p-3">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>
                    Prediction formula: <code className="text-foreground">Quiz × 0.5 + Skills × 0.3 + Experience × 0.2</code>
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Timeline chart */}
            {timelineChartData.length > 0 && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Prediction vs. Quiz Score Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineChartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                        <Tooltip
                          content={({ active, payload }) =>
                            active && payload?.length ? (
                              <div className="bg-background border rounded-xl p-3 shadow text-sm space-y-1">
                                <p className="text-xs text-muted-foreground">{payload[0]?.payload?.date}</p>
                                {payload.map((p) => (
                                  <p key={p.name} style={{ color: p.color }} className="font-semibold">
                                    {p.name}: {p.value}%
                                  </p>
                                ))}
                              </div>
                            ) : null
                          }
                        />
                        <Legend />
                        <Line type="monotone" dataKey="Quiz Score" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Predicted Match" stroke="#10b981" strokeWidth={2.5} strokeDasharray="5 3" dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Dashed line = predicted skill match recalculated at each quiz attempt.
                  </p>
                </CardContent>
              </Card>
            )}

            {timelineChartData.length === 0 && (
              <Card className="border border-dashed">
                <CardContent className="py-10 text-center text-muted-foreground text-sm">
                  Take at least one quiz on the Interview Prep page to see the prediction timeline.
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="border border-dashed">
            <CardContent className="py-10 text-center text-muted-foreground text-sm">
              Set a target role in your profile to enable skill gap accuracy predictions.
            </CardContent>
          </Card>
        )}
      </section>

      {/* ── SECTION 2: Recommendation Accuracy ── */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Recommendation Accuracy</h2>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">
          Precision@K — how many of the top-K recommended courses did you actually click?
        </p>

        {recommendationAccuracy.interactedCount > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard
                label="Precision @ 3"
                value={recommendationAccuracy.precision3}
                color={colorFor(recommendationAccuracy.precision3)}
                note="Top-3 recommended vs. clicked"
              />
              <MetricCard
                label="Precision @ 5"
                value={recommendationAccuracy.precision5}
                color={colorFor(recommendationAccuracy.precision5)}
                note="Top-5 recommended vs. clicked"
              />
              <MetricCard
                label="Courses Clicked"
                value={recommendationAccuracy.interactedCount}
                suffix=""
                color="text-blue-500"
                note="Distinct courses viewed"
              />
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-base">How Precision@K is Computed</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  The TF-IDF engine ranks all courses by cosine similarity to your profile.
                  Precision@K = (courses you clicked that appear in top K) ÷ K.
                </p>
                <p>
                  A higher score means the ranking algorithm successfully surfaced courses you
                  found relevant.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-foreground">
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Top-3 hits</p>
                    <p className="font-bold text-lg">
                      {recommendationAccuracy.topRecommendedIds
                        .slice(0, 3)
                        .filter((id) => recommendationAccuracy.interactedCourseIds.includes(id)).length}
                      <span className="text-sm font-normal text-muted-foreground"> / 3</span>
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Top-5 hits</p>
                    <p className="font-bold text-lg">
                      {recommendationAccuracy.topRecommendedIds
                        .slice(0, 5)
                        .filter((id) => recommendationAccuracy.interactedCourseIds.includes(id)).length}
                      <span className="text-sm font-normal text-muted-foreground"> / 5</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border border-dashed">
            <CardContent className="py-10 text-center text-muted-foreground text-sm">
              No course interactions recorded yet. Visit{" "}
              <a href="/courses" className="text-primary underline">Course Recommendations</a>{" "}
              and click "View Course" on any course to start tracking recommendation accuracy.
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
