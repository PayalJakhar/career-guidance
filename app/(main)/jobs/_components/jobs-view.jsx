"use client";

import React, { useState } from "react";
import {
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Briefcase,
  ExternalLink,
  Globe,
  IndianRupee,
  Search,
} from "lucide-react";

const TABS = ["All", "India", "International", "Remote"];

const typeColors = {
  "Full-time": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Remote: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Hybrid: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

const skillColors = [
  "bg-teal-600/20 border-teal-500/30 text-teal-300",
  "bg-blue-600/20 border-blue-500/30 text-blue-300",
  "bg-violet-600/20 border-violet-500/30 text-violet-300",
  "bg-cyan-600/20 border-cyan-500/30 text-cyan-300",
];

function JobCard({ job }) {
  const typeClass = typeColors[job.type] || "bg-muted text-muted-foreground border-border";
  const isIndia = job.region === "India";

  return (
    <div className="group rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col">
      {/* Header */}
      <div className="p-5 pb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-base leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {job.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground font-medium truncate">{job.company}</span>
          </div>
        </div>
        <span
          className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${typeClass}`}
        >
          {job.type}
        </span>
      </div>

      {/* Meta row */}
      <div className="px-5 pb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {job.location}
        </span>
        <span className="flex items-center gap-1">
          {isIndia ? (
            <IndianRupee className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <DollarSign className="h-3.5 w-3.5 shrink-0" />
          )}
          {job.salary}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5 shrink-0" />
          {job.experience}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          {job.posted}
        </span>
      </div>

      {/* Description */}
      <p className="px-5 pb-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {job.description}
      </p>

      {/* Skills */}
      <div className="px-5 pb-4 flex flex-wrap gap-1.5">
        {job.skills.slice(0, 4).map((skill, i) => (
          <span
            key={skill}
            className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${skillColors[i % skillColors.length]}`}
          >
            {skill}
          </span>
        ))}
        {job.skills.length > 4 && (
          <span className="text-[11px] px-2 py-0.5 rounded-full border bg-muted text-muted-foreground font-medium">
            +{job.skills.length - 4}
          </span>
        )}
      </div>

      {/* Apply button */}
      <div className="px-5 pb-5 mt-auto">
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/30 hover:border-primary text-sm font-semibold py-2.5 transition-all duration-200"
        >
          Apply Now
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

export default function JobsView({ jobs, profile }) {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = jobs.filter((job) => {
    const matchTab =
      activeTab === "All" ||
      (activeTab === "India" && job.region === "India") ||
      (activeTab === "International" && job.region === "International") ||
      (activeTab === "Remote" && job.type === "Remote");

    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q) ||
      job.skills.some((s) => s.toLowerCase().includes(q));

    return matchTab && matchSearch;
  });

  const indiaCount = jobs.filter((j) => j.region === "India").length;
  const intlCount = jobs.filter((j) => j.region === "International").length;
  const remoteCount = jobs.filter((j) => j.type === "Remote").length;
  const tabCounts = { All: jobs.length, India: indiaCount, International: intlCount, Remote: remoteCount };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Job Listings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI-curated openings for{" "}
            <span className="text-primary font-semibold">{profile.targetRole}</span>
            {profile.targetLevel && (
              <span className="text-muted-foreground"> · {profile.targetLevel}</span>
            )}
            {profile.experience != null && (
              <span className="text-muted-foreground"> · {profile.experience}yr exp</span>
            )}
          </p>
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search jobs, skills…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
              activeTab === tab
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {tab === "India" && <IndianRupee className="h-3.5 w-3.5" />}
            {tab === "International" && <Globe className="h-3.5 w-3.5" />}
            {tab}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab ? "bg-white/20" : "bg-muted"
              }`}
            >
              {tabCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No jobs found for this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground pb-4">
        Listings are AI-generated based on your profile. Always verify details on the company's official careers page.
      </p>
    </div>
  );
}
