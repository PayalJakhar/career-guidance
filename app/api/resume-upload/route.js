import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const ANALYSIS_PROMPT = (text) => `
You are an expert resume reviewer and career coach. Analyze the following resume text thoroughly and return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:

{
  "overallScore": <integer 0-100>,
  "scoreLabel": "<one of: Excellent | Good | Average | Needs Improvement>",
  "summary": "<2-3 sentence overall assessment of the resume>",
  "strengths": ["<specific strength>", "<specific strength>", "<specific strength>"],
  "improvements": [
    { "area": "<area name>", "issue": "<what is wrong>", "suggestion": "<how to fix it>" }
  ],
  "missingSkills": ["<skill>", "<skill>"],
  "atsOptimization": ["<ATS tip>", "<ATS tip>"],
  "sectionFeedback": {
    "contactInfo": "<feedback or 'Not found' if missing>",
    "summary": "<feedback on professional summary or 'Missing - strongly recommended'>",
    "experience": "<feedback on work experience section>",
    "education": "<feedback on education section>",
    "skills": "<feedback on skills section>"
  },
  "formatAndStructure": "<feedback on overall format, length, readability, and structure>",
  "keywordSuggestions": ["<keyword>", "<keyword>", "<keyword>"],
  "actionVerbs": {
    "used": ["<verb found in resume>"],
    "suggested": ["<strong action verb to add>"]
  },
  "quantificationScore": <integer 0-10 rating of how well achievements are quantified>,
  "quantificationTip": "<specific tip on adding numbers/metrics to achievements>"
}

Resume text to analyze:
${text}
`;

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("resume");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or DOCX file." },
        { status: 400 }
      );
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";

    if (file.type === "application/pdf") {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      extractedText = textResult.text;
      await parser.destroy();
    } else {
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from the file. Make sure the file is not scanned/image-based." },
        { status: 400 }
      );
    }

    const result = await model.generateContent(ANALYSIS_PROMPT(extractedText));
    const responseText = result.response.text().trim();

    let analysis;
    try {
      const jsonMatch =
        responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
        responseText.match(/(\{[\s\S]*\})/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[1] : responseText);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI analysis. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Resume upload/analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume. Please try again." },
      { status: 500 }
    );
  }
}
