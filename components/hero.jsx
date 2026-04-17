
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { features } from "@/data/features";

import {
  Brain,
  Briefcase,
  BarChart3,
  FileText,
} from "lucide-react";

/* icon name → component */
const iconMap = {
  brain: Brain,
  briefcase: Briefcase,
  chart: BarChart3,
  file: FileText,
};

const HeroSection = () => {
  return (
    <section className="relative w-full pt-28 pb-24 px-4 md:px-6 overflow-hidden">

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

        {/* LEFT SIDE */}
        <div className="space-y-8 text-left">
          <h1 className="text-5xl md:text-6xl font-bold gradient-title animate-gradient">
            Your AI Career Coach
          </h1>

          <p className="text-muted-foreground md:text-xl max-w-[550px]">
            Personalized guidance and AI-powered tools for job success.
          </p>

          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button size="lg">Get Started</Button>
            </Link>

            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>

        {/* RIGHT SIDE – BENTO GRID */}
        <div className="grid grid-cols-2 grid-rows-6 gap-3 h-[420px] md:h-[480px]">
          {features.slice(0, 4).map((feature, index) => {
            const gridSpans = [
              "row-span-2",
              "row-span-2",
              "row-span-3",
              "row-span-2",
            ];

            const Icon = iconMap[feature.icon];

            return (
              <Link
                key={index}
                href={feature.route}   // ✅ SAFE STRING ROUTE
                className={`${gridSpans[index]} block`}
              >
                <Card className="group relative h-full overflow-hidden border-none shadow-xl transition-all hover:scale-[1.02] bg-slate-900 cursor-pointer">

                  {/* BACKGROUND IMAGE */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${feature.image})`,
                      filter: "brightness(0.75) contrast(1.05)",
                    }}
                  />

                  {/* OVERLAY */}
                  <div className="absolute inset-0 bg-black/25" />

                  <CardContent className="relative z-10 h-full p-4 flex flex-col justify-end text-white">
                    <div className="mb-2 w-fit p-2 bg-white/15 rounded-lg border border-white/25">
                      {Icon && <Icon className="h-6 w-6" />}
                    </div>

                    <h3 className="text-lg font-semibold">
                      {feature.title}
                    </h3>

                    <p className="text-xs text-gray-200 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {feature.description}
                    </p>
                  </CardContent>

                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* DASHBOARD PREVIEW IMAGE */}
      <div className="relative mt-[-40px] md:mt-[-60px] z-0">
        <div className="max-w-6xl mx-auto px-4 overflow-hidden">
          <div className="max-h-[260px] md:max-h-[320px] overflow-hidden rounded-xl">
            <Image
              src="/banner.jpeg"
              width={1280}
              height={720}
              alt="Dashboard Preview"
              className="rounded-xl shadow-2xl border mx-auto"
              priority
            />
          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;
