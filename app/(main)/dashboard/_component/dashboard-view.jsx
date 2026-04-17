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
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const DashboardView = ({ insights }) => {
  const salaryData = insights.salaryRanges.map((range) => ({
    name: range.role,
    min: range.min / 1000,
    max: range.max / 1000,
    median: range.median / 1000,
  }));

  const getDemandLevelStyle = (level) => {
    switch (level.toLowerCase()) {
      case "high":
        return {
          textColor: "text-emerald-600 dark:text-emerald-400",
          cardClass:
            "border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5",
          iconClass: "text-emerald-500",
          iconBorder: "border-emerald-400/30",
          barActive: "bg-emerald-500",
          segments: 3,
        };
      case "medium":
        return {
          textColor: "text-amber-600 dark:text-amber-400",
          cardClass:
            "border-amber-400/30 bg-gradient-to-br from-amber-500/15 to-amber-500/5",
          iconClass: "text-amber-500",
          iconBorder: "border-amber-400/30",
          barActive: "bg-amber-500",
          segments: 2,
        };
      case "low":
        return {
          textColor: "text-red-600 dark:text-red-400",
          cardClass:
            "border-red-400/30 bg-gradient-to-br from-red-500/15 to-red-500/5",
          iconClass: "text-red-500",
          iconBorder: "border-red-400/30",
          barActive: "bg-red-500",
          segments: 1,
        };
      default:
        return {
          textColor: "text-gray-600",
          cardClass: "border-gray-400/30 bg-gradient-to-br from-gray-500/15 to-gray-500/5",
          iconClass: "text-gray-500",
          iconBorder: "border-gray-400/30",
          barActive: "bg-gray-500",
          segments: 0,
        };
    }
  };

  const getMarketOutlookInfo = (outlook) => {
    switch (outlook.toLowerCase()) {
      case "positive":
        return {
          icon: TrendingUp,
          textColor: "text-emerald-600 dark:text-emerald-400",
          cardClass:
            "border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5",
          iconClass: "text-emerald-500",
          iconBorder: "border-emerald-400/30",
        };
      case "neutral":
        return {
          icon: LineChart,
          textColor: "text-amber-600 dark:text-amber-400",
          cardClass:
            "border-amber-400/30 bg-gradient-to-br from-amber-500/15 to-amber-500/5",
          iconClass: "text-amber-500",
          iconBorder: "border-amber-400/30",
        };
      case "negative":
        return {
          icon: TrendingDown,
          textColor: "text-red-600 dark:text-red-400",
          cardClass:
            "border-red-400/30 bg-gradient-to-br from-red-500/15 to-red-500/5",
          iconClass: "text-red-500",
          iconBorder: "border-red-400/30",
        };
      default:
        return {
          icon: LineChart,
          textColor: "text-gray-600",
          cardClass: "border-gray-400/30 bg-gradient-to-br from-gray-500/15 to-gray-500/5",
          iconClass: "text-gray-500",
          iconBorder: "border-gray-400/30",
        };
    }
  };

  const outlookInfo = getMarketOutlookInfo(insights.marketOutlook);
  const OutlookIcon = outlookInfo.icon;
  const demandStyle = getDemandLevelStyle(insights.demandLevel);

  const lastUpdatedDate = format(new Date(insights.lastUpdated), "dd/MM/yyyy");
  const nextUpdateDistance = formatDistanceToNow(new Date(insights.nextUpdate), {
    addSuffix: true,
  });

  const skillColors = [
    "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
    "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  ];

  return (
    <div className="space-y-8">
      {/* Meta badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Updated {lastUpdatedDate}
        </Badge>
        <Badge
          variant="secondary"
          className="flex items-center gap-1.5 px-3 py-1 text-xs"
        >
          <CalendarClock className="h-3 w-3" />
          Refresh {nextUpdateDistance}
        </Badge>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Market Outlook */}
        <Card className={`overflow-hidden border ${outlookInfo.cardClass}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Market Outlook
              </p>
              <div
                className={`p-2 rounded-full border ${outlookInfo.iconBorder} bg-background/60`}
              >
                <OutlookIcon className={`h-4 w-4 ${outlookInfo.iconClass}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-extrabold ${outlookInfo.textColor}`}>
              {insights.marketOutlook}
            </p>
          </CardContent>
        </Card>

        {/* Industry Growth */}
        <Card className="overflow-hidden border border-blue-400/30 bg-gradient-to-br from-blue-500/15 to-blue-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Industry Growth
              </p>
              <div className="p-2 rounded-full border border-blue-400/30 bg-background/60">
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {insights.growthRate.toFixed(1)}%
            </p>
            <Progress value={insights.growthRate} className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        {/* Demand Level */}
        <Card className={`overflow-hidden border ${demandStyle.cardClass}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Demand Level
              </p>
              <div
                className={`p-2 rounded-full border ${demandStyle.iconBorder} bg-background/60`}
              >
                <BriefcaseIcon className={`h-4 w-4 ${demandStyle.iconClass}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-extrabold ${demandStyle.textColor}`}>
              {insights.demandLevel}
            </p>
            <div className="flex gap-1 mt-3">
              {[1, 2, 3].map((seg) => (
                <div
                  key={seg}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    seg <= demandStyle.segments
                      ? demandStyle.barActive
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Skills */}
        <Card className="overflow-hidden border border-violet-400/30 bg-gradient-to-br from-violet-500/15 to-violet-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Top Skills
              </p>
              <div className="p-2 rounded-full border border-violet-400/30 bg-background/60">
                <Brain className="h-4 w-4 text-violet-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {insights.topSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 text-xs font-medium rounded-full bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-400/25"
                >
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Chart */}
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold">
                Salary Ranges by Role
              </CardTitle>
              <CardDescription className="mt-1">
                Min, median &amp; max salaries in thousands (USD)
              </CardDescription>
            </div>
            <Badge variant="outline" className="shrink-0 text-xs">
              Annual
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData} barGap={4} barCategoryGap="30%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}K`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-xl p-3 shadow-lg text-sm min-w-[140px]">
                          <p className="font-semibold mb-2">{label}</p>
                          {payload.map((item) => (
                            <div
                              key={item.name}
                              className="flex items-center gap-2 py-0.5"
                            >
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full"
                                style={{ background: item.fill }}
                              />
                              <span className="text-muted-foreground">
                                {item.name}:
                              </span>
                              <span className="font-medium ml-auto">
                                ${item.value}K
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
                />
                <Bar dataKey="min" fill="#BADFE7" name="Min" radius={[4, 4, 0, 0]} />
                <Bar dataKey="median" fill="#6FB3B8" name="Median" radius={[4, 4, 0, 0]} />
                <Bar dataKey="max" fill="#388087" name="Max" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Trends + Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Key Industry Trends
            </CardTitle>
            <CardDescription>
              Current forces shaping the market
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <ol className="space-y-4">
              {insights.keyTrends.map((trend, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed pt-0.5">{trend}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Recommended Skills
            </CardTitle>
            <CardDescription>High-impact skills to develop next</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="flex flex-wrap gap-2">
              {insights.recommendedSkills.map((skill, idx) => (
                <span
                  key={skill}
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    skillColors[idx % 3]
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardView;
