"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, AlertCircle } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function SkillGapPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [skillGapData, setSkillGapData] = useState(null);

  useEffect(() => {
    fetchSkillGapAnalysis();
  }, []);

  const fetchSkillGapAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/skillgap");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.details || data.error || "Failed to fetch skill gap analysis");
      }

      setUserData(data.userData);
      setSkillGapData(data.skillGapAnalysis);
    } catch (err) {
      const errorMessage = err.message || "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error fetching skill gap:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">
            Analyzing your skill gap with AI...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchSkillGapAnalysis} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userData || !skillGapData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please complete your profile with current role, experience, and
              target role to see your skill gap analysis.
            </p>
            <Button onClick={() => (window.location.href = "/welcome")} className="w-full">
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold gradient-title">
              Skill Gap Analysis
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Comparing {userData.role || "Professional"} with Target Role:{" "}
            {userData.targetRole || "QA Engineer"}
          </p>
        </div>

        {/* Visual Skill Comparison */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Visual Skill Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={skillGapData.radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={90} domain={[0, 10]} />
                <Radar
                  name="Your Skills"
                  dataKey="yourLevel"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Target Role Requirements"
                  dataKey="targetLevel"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Skills to Develop */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Skills to Develop</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {skillGapData.skillsToDevelop.map((skill, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{skill.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {skill.reason}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Your Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Your Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {skillGapData.strengths.map((strength, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{strength.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {strength.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Learning Roadmap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Recommended Learning Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillGapData.learningRoadmap.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-lg border bg-card"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{step.phase}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step.resources.map((resource, rIndex) => (
                        <span
                          key={rIndex}
                          className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                        >
                          {resource}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>AI Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {skillGapData.summary}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}