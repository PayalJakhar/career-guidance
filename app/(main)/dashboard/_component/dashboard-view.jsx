"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BriefcaseIcon,
  LineChart,
  TrendingUp,
  TrendingDown,
  Brain,
  Sparkles,
  Activity,
  CalendarClock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Progress } from "@/components/ui/progress";

const DashboardView = ({ insights }) => {
  const salaryData = insights.salaryRanges.map((range) => ({
    name: range.role,
    min: range.min / 1000,
    max: range.max / 1000,
    median: range.median / 1000,
  }));

  const getDemandConfig = (level) => {
    switch (level.toLowerCase()) {
      case "high":
        return { filled: 3, color: "bg-emerald-500", text: "text-emerald-400" };
      case "medium":
        return { filled: 2, color: "bg-amber-500", text: "text-amber-400" };
      case "low":
        return { filled: 1, color: "bg-red-500", text: "text-red-400" };
      default:
        return { filled: 0, color: "bg-gray-500", text: "text-gray-400" };
    }
  };

  const getOutlookConfig = (outlook) => {
    switch (outlook.toLowerCase()) {
      case "positive":
        return { icon: TrendingUp, color: "text-emerald-400", glow: "shadow-emerald-500/30" };
      case "neutral":
        return { icon: LineChart, color: "text-amber-400", glow: "shadow-amber-500/30" };
      case "negative":
        return { icon: TrendingDown, color: "text-red-400", glow: "shadow-red-500/30" };
      default:
        return { icon: LineChart, color: "text-gray-400", glow: "shadow-gray-500/30" };
    }
  };

  const outlookCfg = getOutlookConfig(insights.marketOutlook);
  const demandCfg = getDemandConfig(insights.demandLevel);
  const OutlookIcon = outlookCfg.icon;

  const lastUpdatedDate = format(new Date(insights.lastUpdated), "dd/MM/yyyy");
  const nextUpdateDistance = formatDistanceToNow(new Date(insights.nextUpdate), {
    addSuffix: true,
  });

  const skillTileColors = [
    "bg-teal-600/20 border-teal-500/30 text-teal-200 hover:bg-teal-600/30",
    "bg-blue-600/20 border-blue-500/30 text-blue-200 hover:bg-blue-600/30",
    "bg-violet-600/20 border-violet-500/30 text-violet-200 hover:bg-violet-600/30",
    "bg-cyan-600/20 border-cyan-500/30 text-cyan-200 hover:bg-cyan-600/30",
    "bg-indigo-600/20 border-indigo-500/30 text-indigo-200 hover:bg-indigo-600/30",
  ];

  return (
    <div className="space-y-6">

      {/* ── HERO BANNER ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 text-white"
        style={{
          background: "linear-gradient(135deg, hsl(185,41%,22%) 0%, hsl(185,36%,36%) 60%, hsl(190,45%,50%) 100%)",
        }}
      >
        {/* dot grid decoration */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* big faded icon */}
        <OutlookIcon className="absolute -right-6 -bottom-6 h-48 w-48 opacity-10" />

        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70 mb-3">
              Market Outlook
            </p>
            <div className="flex items-center gap-4">
              <OutlookIcon className={`h-10 w-10 ${outlookCfg.color}`} />
              <h2 className="text-6xl font-black tracking-tight">
                {insights.marketOutlook}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-xs font-medium backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Updated {lastUpdatedDate}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-xs font-medium backdrop-blur-sm">
              <CalendarClock className="h-3.5 w-3.5" />
              Refresh {nextUpdateDistance}
            </span>
          </div>
        </div>
      </div>

      {/* ── STAT PANELS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Growth */}
        <div className="rounded-2xl border-2 border-border bg-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Industry Growth
            </p>
            <Activity className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-7xl font-black text-blue-500 leading-none">
            {insights.growthRate.toFixed(1)}
            <span className="text-3xl font-bold">%</span>
          </p>
          <Progress value={insights.growthRate} className="mt-5 h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Annual growth rate
          </p>
        </div>

        {/* Demand */}
        <div className="rounded-2xl border-2 border-border bg-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Demand Level
            </p>
            <BriefcaseIcon className={`h-4 w-4 ${demandCfg.text}`} />
          </div>
          <p className={`text-7xl font-black leading-none ${demandCfg.text}`}>
            {insights.demandLevel}
          </p>
          <div className="flex gap-2 mt-5">
            {[1, 2, 3].map((seg) => (
              <div
                key={seg}
                className={`h-2.5 flex-1 rounded-full transition-colors ${
                  seg <= demandCfg.filled ? demandCfg.color : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Talent market demand
          </p>
        </div>

        {/* Top Skills */}
        <div className="rounded-2xl border-2 border-border bg-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Top Skills
            </p>
            <Brain className="h-4 w-4 text-violet-500" />
          </div>
          <p className="text-7xl font-black text-violet-500 leading-none">
            {insights.topSkills.length}
            <span className="text-3xl font-bold"> skills</span>
          </p>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {insights.topSkills.map((skill) => (
              <span
                key={skill}
                className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20 font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── SALARY CHART (horizontal) ── */}
      <div className="rounded-2xl border-2 border-border bg-card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold">Salary Ranges by Role</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Annual compensation in thousands (USD)
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
            Annual
          </span>
        </div>

        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={salaryData}
              margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
              barGap={3}
              barCategoryGap="30%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}K`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-xl p-3 shadow-lg text-sm min-w-[150px]">
                        <p className="font-semibold mb-2 border-b pb-1">{label}</p>
                        {payload.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center gap-2 py-0.5"
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ background: item.fill }}
                            />
                            <span className="text-muted-foreground">{item.name}:</span>
                            <span className="font-bold ml-auto">${item.value}K</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
              <Bar dataKey="min" fill="#BADFE7" name="Min" radius={[0, 4, 4, 0]} />
              <Bar dataKey="median" fill="#6FB3B8" name="Median" radius={[0, 4, 4, 0]} />
              <Bar dataKey="max" fill="#388087" name="Max" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── TRENDS + SKILLS ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        {/* Trends — timeline style */}
        <div className="md:col-span-3 rounded-2xl border-2 border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold">Key Industry Trends</h3>
          </div>

          <div className="relative pl-4">
            {/* vertical line */}
            <div className="absolute left-4 top-3 bottom-3 w-px bg-border" />

            <div className="space-y-6">
              {insights.keyTrends.map((trend, index) => (
                <div key={index} className="relative flex gap-4 pl-6">
                  {/* circle on the line */}
                  <span className="absolute -left-[1px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-black shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {trend}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Skills — tile grid */}
        <div className="md:col-span-2 rounded-2xl border-2 border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold">Recommended Skills</h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {insights.recommendedSkills.map((skill, idx) => (
              <div
                key={skill}
                className={`rounded-xl border p-3 text-xs font-semibold text-center transition-colors cursor-default ${
                  skillTileColors[idx % skillTileColors.length]
                }`}
              >
                {skill}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            {insights.recommendedSkills.length} skills to develop
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
