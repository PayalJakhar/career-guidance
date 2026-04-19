"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { completeProfile } from "@/actions/user";

const STATE_CITY_MAP = {
  Karnataka: ["Bengaluru", "Mysuru", "Mangaluru"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur"],
  TamilNadu: ["Chennai", "Coimbatore", "Madurai"],
  Delhi: ["New Delhi"],
};

export default function WelcomeFormPage() {
  const { user } = useUser();
  const router = useRouter();

  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    currentRole: "",
    experience: "",
    targetRole: "",
    targetLevel: "",
  });

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
  try {
    setLoading(true);

    await completeProfile({
      state,
      city,
      ...formData,
    });

    router.push("/");
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold gradient-title">
            Complete Your Profile
          </CardTitle>
          <p className="text-muted-foreground">
            Help us personalize your career roadmap 🚀
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* NAME */}
          <Input value={user?.fullName || ""} disabled />

          {/* EMAIL */}
          <Input
            value={user?.primaryEmailAddress?.emailAddress || ""}
            disabled
          />

          {/* STATE */}
          <Select
            onValueChange={(value) => {
              setState(value);
              setCity("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(STATE_CITY_MAP).map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* CITY */}
          <Select disabled={!state} onValueChange={setCity}>
            <SelectTrigger>
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {state &&
                STATE_CITY_MAP[state].map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* CURRENT ROLE */}
          <Select onValueChange={(v) => handleChange("currentRole", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Current Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Software Engineer">Software Engineer</SelectItem>
              <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
              <SelectItem value="Backend Developer">Backend Developer</SelectItem>
              <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
              <SelectItem value="AI Engineer">AI Engineer</SelectItem>
              <SelectItem value="ML Engineer">ML Engineer</SelectItem>
              <SelectItem value="Data Scientist">Data Scientist</SelectItem>
              <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
              <SelectItem value="QA Engineer">QA Engineer</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          {/* EXPERIENCE */}
          <Select onValueChange={(v) => handleChange("experience", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Years of Experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0</SelectItem>
              <SelectItem value="0-1">0–1</SelectItem>
              <SelectItem value="1-3">1–3</SelectItem>
              <SelectItem value="3-5">3–5</SelectItem>
              <SelectItem value="5+">5+</SelectItem>
            </SelectContent>
          </Select>

          {/* TARGET ROLE */}
          <Select onValueChange={(v) => handleChange("targetRole", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Target Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Software Engineer">Software Engineer</SelectItem>
              <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
              <SelectItem value="Backend Developer">Backend Developer</SelectItem>
              <SelectItem value="Data Scientist">Data Scientist</SelectItem>
              <SelectItem value="AI Engineer">AI Engineer</SelectItem>
            </SelectContent>
          </Select>

          {/* TARGET LEVEL */}
          <Select onValueChange={(v) => handleChange("targetLevel", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Target Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Entry">Entry Level</SelectItem>
              <SelectItem value="Mid">Mid Level</SelectItem>
              <SelectItem value="Senior">Senior Level</SelectItem>
            </SelectContent>
          </Select>

          {/* SUBMIT */}
          <Button
            className="w-full h-11 text-lg"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Complete Profile →"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}