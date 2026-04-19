"use client";

import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Target,
  Zap,
  BarChart2,
  FileSearch,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SCORE_CONFIG = {
  Excellent: { color: "text-green-600", bg: "bg-green-500", badge: "bg-green-100 text-green-700" },
  Good: { color: "text-blue-600", bg: "bg-blue-500", badge: "bg-blue-100 text-blue-700" },
  Average: { color: "text-yellow-600", bg: "bg-amber-400", badge: "bg-yellow-100 text-yellow-700" },
  "Needs Improvement": { color: "text-red-600", bg: "bg-red-500", badge: "bg-red-100 text-red-700" },
};

function ScoreRing({ score, label }) {
  const config = SCORE_CONFIG[label] || SCORE_CONFIG["Average"];
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            className={`transition-all duration-700`}
            stroke={
              label === "Excellent" ? "#16a34a"
              : label === "Good" ? "#2563eb"
              : label === "Average" ? "#d97706"
              : "#dc2626"
            }
            strokeDasharray={`${(score / 100) * 314} 314`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${config.color}`}>{score}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${config.badge}`}>
        {label}
      </span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, className = "" }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function ResumeAnalysis({ analysis, onReset }) {
  if (!analysis) return null;

  const {
    overallScore,
    scoreLabel,
    summary,
    strengths = [],
    improvements = [],
    missingSkills = [],
    atsOptimization = [],
    sectionFeedback = {},
    formatAndStructure,
    keywordSuggestions = [],
    actionVerbs = {},
    quantificationScore,
    quantificationTip,
  } = analysis;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Resume Analysis</h2>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Analyze Another
        </Button>
      </div>

      {/* Score + Summary */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ScoreRing score={overallScore} label={scoreLabel} />
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-lg">Overall Assessment</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{summary}</p>
              {quantificationTip && (
                <div className="flex items-start gap-2 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium text-amber-700">Quantification Score: {quantificationScore}/10 — </span>
                    <span className="text-amber-700">{quantificationTip}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <SectionCard title="What's Working Well" icon={CheckCircle2}>
          <ul className="space-y-2">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Missing Skills */}
        <SectionCard title="Skills to Add" icon={TrendingUp}>
          {missingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  + {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No major skill gaps detected.</p>
          )}
        </SectionCard>
      </div>

      {/* Improvements */}
      {improvements.length > 0 && (
        <SectionCard title="Areas to Improve" icon={XCircle}>
          <div className="space-y-4">
            {improvements.map((item, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-destructive shrink-0" />
                  <span className="font-medium text-sm">{item.area}</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">{item.issue}</p>
                <p className="text-sm text-primary ml-6 font-medium">✦ {item.suggestion}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Section-by-Section Feedback */}
      <SectionCard title="Section-by-Section Feedback" icon={FileSearch}>
        <div className="space-y-3">
          {Object.entries(sectionFeedback).map(([section, feedback]) => (
            <div key={section} className="space-y-1">
              <p className="text-sm font-medium capitalize">
                {section.replace(/([A-Z])/g, " $1")}
              </p>
              <p className="text-sm text-muted-foreground pl-3 border-l-2 border-muted">{feedback}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ATS Optimization */}
        <SectionCard title="ATS Optimization Tips" icon={Target}>
          <ul className="space-y-2">
            {atsOptimization.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Keywords */}
        <SectionCard title="Keyword Suggestions" icon={Zap}>
          {keywordSuggestions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {keywordSuggestions.map((kw, i) => (
                <Badge key={i} className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
                  {kw}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No additional keywords suggested.</p>
          )}
        </SectionCard>
      </div>

      {/* Action Verbs */}
      {(actionVerbs.used?.length > 0 || actionVerbs.suggested?.length > 0) && (
        <SectionCard title="Action Verbs" icon={BarChart2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actionVerbs.used?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Currently Used</p>
                <div className="flex flex-wrap gap-1.5">
                  {actionVerbs.used.map((v, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{v}</Badge>
                  ))}
                </div>
              </div>
            )}
            {actionVerbs.suggested?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Suggested Additions</p>
                <div className="flex flex-wrap gap-1.5">
                  {actionVerbs.suggested.map((v, i) => (
                    <Badge key={i} className="text-xs bg-green-100 text-green-700 hover:bg-green-200">{v}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Format Feedback */}
      {formatAndStructure && (
        <SectionCard title="Format & Structure" icon={BarChart2}>
          <p className="text-sm text-muted-foreground">{formatAndStructure}</p>
        </SectionCard>
      )}
    </div>
  );
}
