import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const jobDescription = formData.get("jobDescription") as string;
    const resumeFile = formData.get("resume") as File | null;
    let resumeText = formData.get("resumeText") as string;

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    if (!resumeFile && !resumeText) {
      return NextResponse.json(
        { error: "Resume (file or text) is required" },
        { status: 400 }
      );
    }

    // Call Gemini API
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      You are an expert ATS (Applicant Tracking System) and technical recruiter.
      Analyze the provided Resume against the Job Description.

      Extract the skills from both, compare them, and provide a verdict on the candidate's fit.
      
      Output exactly and ONLY valid JSON matching this schema:
      {
        "matchedSkills": ["Skill 1", "Skill 2"],
        "missingSkills": ["Skill 3", "Skill 4"],
        "matchPercentage": 75, // integer 0-100 based on how well the skills match
        "verdict": "Qualified" | "Almost There" | "Not Yet",
        "reasons": [
          "Reason 1 for the verdict (concise)",
          "Reason 2 for the verdict (concise)",
          "Reason 3 for the verdict (concise)"
        ]
      }

      Job Description:
      ${jobDescription}
    `;

    // Prepare parts for Gemini
    const parts: any[] = [{ text: prompt }];

    if (resumeFile && resumeFile.name.endsWith(".pdf")) {
      try {
        const arrayBuffer = await resumeFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        parts.push({
          inlineData: {
            data: buffer.toString("base64"),
            mimeType: "application/pdf",
          },
        });
      } catch (error) {
        console.error("PDF Processing Error:", error);
        return NextResponse.json(
          { error: "Failed to process PDF file" },
          { status: 500 }
        );
      }
    } else if (resumeText) {
      parts.push({
        text: `\n\nCandidate Resume:\n${resumeText}`,
      });
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();
    let jsonResult;
    try {
      jsonResult = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse Gemini response as JSON:", responseText);
      return NextResponse.json(
        { error: "Failed to generate structured analysis from AI" },
        { status: 500 }
      );
    }

    return NextResponse.json(jsonResult);
  } catch (error: unknown) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
