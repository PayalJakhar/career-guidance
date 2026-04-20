"use client";

import { useState, useTransition } from "react";
import { Sparkles, Target, GraduationCap, Filter, Star, Clock, DollarSign, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRecommendedCourses } from "@/actions/courses";

function MatchScoreRing({ score }) {
  const color =
    score >= 80 ? "#16a34a" : score >= 60 ? "#2563eb" : score >= 40 ? "#d97706" : "#6b7280";

  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r="24" fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="28"
          cy="28"
          r="24"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          stroke={color}
          strokeDasharray={`${(score / 100) * 150.8} 150.8`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

function CourseCard({ course }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span className="font-medium">{course.platform}</span>
              {course.provider && (
                <>
                  <span>•</span>
                  <span>{course.provider}</span>
                </>
              )}
            </div>
            <h3 className="font-semibold leading-tight line-clamp-2">{course.title}</h3>
          </div>
          <MatchScoreRing score={course.matchScore} />
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {course.skills.slice(0, 4).map((skill, i) => (
            <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
          ))}
          {course.skills.length > 4 && (
            <Badge variant="outline" className="text-xs">+{course.skills.length - 4}</Badge>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3" />
            {course.level}
          </span>
          {course.duration && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {course.duration}
            </span>
          )}
          {course.price && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {course.price}
            </span>
          )}
          {course.rating && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {course.rating}
            </span>
          )}
        </div>

        <Button asChild className="w-full" size="sm">
          <a href={course.url} target="_blank" rel="noopener noreferrer">
            View Course
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function CoursesView({ initialCourses, userContext, filters }) {
  const [courses, setCourses] = useState(initialCourses);
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [isPending, startTransition] = useTransition();

  const applyFilters = (newCategory, newLevel) => {
    startTransition(async () => {
      const result = await getRecommendedCourses({
        filters: {
          ...(newCategory !== "all" && { category: newCategory }),
          ...(newLevel !== "all" && { level: newLevel }),
        },
      });
      setCourses(result.courses);
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-bold gradient-title text-5xl md:text-6xl">
          Course Recommendations
        </h1>
        <p className="text-muted-foreground">
          AI-powered course matches ranked by semantic similarity to your career goals.
        </p>
      </div>

      {/* Personalization Context */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1">Recommendations tailored for you</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {userContext.targetRole && (
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Target: <span className="font-medium text-foreground">{userContext.targetRole}</span>
                    {userContext.targetLevel && <span className="text-xs">({userContext.targetLevel})</span>}
                  </span>
                )}
                {userContext.currentRole && (
                  <span>Current: <span className="font-medium text-foreground">{userContext.currentRole}</span></span>
                )}
                {userContext.industry && (
                  <span>Industry: <span className="font-medium text-foreground">{userContext.industry}</span></span>
                )}
              </div>
              {userContext.missingSkills?.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Skills to develop:</span>
                  {userContext.missingSkills.slice(0, 6).map((s, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4" />
          Filters:
        </div>
        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v);
            applyFilters(v, level);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {filters.categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={level}
          onValueChange={(v) => {
            setLevel(v);
            applyFilters(category, v);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {filters.levels.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Results */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No courses found. Try adjusting your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      <div className="text-center text-xs text-muted-foreground pt-4">
        Powered by Google text-embedding-004 · Cosine similarity ranking
      </div>
    </div>
  );
}
