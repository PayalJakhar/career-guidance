"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { TrendingUp } from "lucide-react";

export default function PerformanceChart({ assessments }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (assessments) {
      const formattedData = [...assessments].reverse().map((assessment) => ({
        date: format(new Date(assessment.createdAt), "MMM dd"),
        score: Math.round(assessment.quizScore * 10) / 10,
      }));
      setChartData(formattedData);
    }
  }, [assessments]);

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold">Performance Trend</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Your quiz scores over time
          </p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
          Score %
        </span>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <ReferenceLine
              y={70}
              stroke="hsl(var(--primary))"
              strokeDasharray="6 3"
              strokeOpacity={0.5}
              label={{
                value: "Target",
                position: "right",
                fontSize: 10,
                fill: "hsl(var(--muted-foreground))",
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  const val = payload[0].value;
                  const color =
                    val >= 80
                      ? "#10b981"
                      : val >= 60
                      ? "#f59e0b"
                      : "#ef4444";
                  return (
                    <div className="bg-background border rounded-xl p-3 shadow-lg text-sm">
                      <p className="text-muted-foreground text-xs mb-1">
                        {payload[0].payload.date}
                      </p>
                      <p className="font-black text-2xl" style={{ color }}>
                        {val}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              fill="url(#scoreGradient)"
              dot={{ fill: "hsl(var(--primary))", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
