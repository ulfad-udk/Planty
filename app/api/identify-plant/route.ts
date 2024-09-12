import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyDvrpHEvsc8Y9_PLigeZ-TaJ-nBZ52Xmxo");

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const image = formData.get("image") as Blob;

  if (!image) {
    console.error("No image provided");
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  try {
    console.log("Initializing Google Generative AI model...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt =
      "Identify this plant and provide its name, scientific name, family, brief description, where it's native to, sunlight needs, watering needs, and soil type.";

    console.log("Generating content...");
    const result = await model.generateContent(
      [
        prompt,
        {
          inlineData: {
            mimeType: image.type,
            data: Buffer.from(await image.arrayBuffer()).toString("base64"),
          },
        },
      ],
      {
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      },
    );

    const response = await result.response;
    const text = response.text();

    console.log("Generated text:", text);

    if (!text) {
      throw new Error("No text generated from the model");
    }

    // Parse the generated text to extract structured information
    const plantInfo = {
      name: extractInfo(text, "Name:") || "Unknown",
      scientificName: extractInfo(text, "Scientific Name:") || "Unknown",
      family: extractInfo(text, "Family:") || "Unknown",
      description:
        extractInfo(text, "Description:") || "No description available.",
      nativeTo: extractInfo(text, "Native to:")
        .split(",")
        .filter(Boolean)
        .map((region: string) => region.trim()),
      sunlight: extractInfo(text, "Sunlight needs:") || undefined,
      watering: extractInfo(text, "Watering needs:") || undefined,
      soil: extractInfo(text, "Soil type:") || undefined,
    };

    console.log("Parsed plant info:", plantInfo);

    return NextResponse.json(plantInfo);
  } catch (error) {
    console.error("Error identifying plant:", error);
    return NextResponse.json(
      {
        error: "Failed to identify plant",
        details: (error as Error).message,
        stack: (error as Error).stack,
      },
      { status: 500 },
    );
  }
}

function extractInfo(text: string, key: string): string {
  const regex = new RegExp(`${key}\\s*(.+)`);
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}
