import { createTool } from "@mastra/core/tools";
import { z } from "zod";

interface SkinAnalysisResponse {
  skinType: "oily" | "dry" | "combination" | "sensitive" | "normal";
  concerns: string[];
  severity: "mild" | "moderate" | "severe";
  confidence: number;
  recommendations: string[];
  needsMedicalAttention: boolean;
}

export const skinAnalysisTool = createTool({
  id: "analyze-skin",
  description: "Analyze skin condition from image description or symptoms",
  inputSchema: z.object({
    imageDescription: z
      .string()
      .describe("Description of the skin image or visible symptoms"),
    userAge: z.number().optional().describe("User age for context"),
    existingConditions: z
      .array(z.string())
      .optional()
      .describe("Known skin conditions"),
    location: z
      .string()
      .optional()
      .describe("Geographic location for environmental factors"),
  }),
  outputSchema: z.object({
    skinType: z.enum(["oily", "dry", "combination", "sensitive", "normal"]),
    concerns: z.array(z.string()),
    severity: z.enum(["mild", "moderate", "severe"]),
    confidence: z.number().min(0).max(1),
    recommendations: z.array(z.string()),
    needsMedicalAttention: z.boolean(),
    analysis: z.string(),
  }),
  execute: async ({ context }) => {
    return await analyzeSkin(context);
  },
});

const analyzeSkin = async ({
  imageDescription,
  userAge,
  existingConditions = [],
  location,
}: {
  imageDescription: string;
  userAge?: number;
  existingConditions?: string[];
  location?: string;
}): Promise<SkinAnalysisResponse & { analysis: string }> => {
  // Simulate skin analysis based on description
  const concerns: string[] = [];
  let skinType: "oily" | "dry" | "combination" | "sensitive" | "normal" =
    "normal";
  let severity: "mild" | "moderate" | "severe" = "mild";
  let confidence = 0.8;
  let needsMedicalAttention = false;

  const description = imageDescription.toLowerCase();

  // Analyze skin type
  if (
    description.includes("oily") ||
    description.includes("shiny") ||
    description.includes("greasy")
  ) {
    skinType = "oily";
  } else if (
    description.includes("dry") ||
    description.includes("flaky") ||
    description.includes("tight")
  ) {
    skinType = "dry";
  } else if (
    description.includes("t-zone") ||
    (description.includes("oily") && description.includes("dry"))
  ) {
    skinType = "combination";
  } else if (
    description.includes("sensitive") ||
    description.includes("irritated") ||
    description.includes("reactive")
  ) {
    skinType = "sensitive";
  }

  // Identify concerns
  if (
    description.includes("acne") ||
    description.includes("pimple") ||
    description.includes("blackhead")
  ) {
    concerns.push("acne");
    if (description.includes("cystic") || description.includes("severe")) {
      severity = "severe";
      needsMedicalAttention = true;
    }
  }

  if (
    description.includes("wrinkle") ||
    description.includes("fine line") ||
    description.includes("aging")
  ) {
    concerns.push("aging");
  }

  if (
    description.includes("dark spot") ||
    description.includes("pigmentation") ||
    description.includes("discoloration")
  ) {
    concerns.push("hyperpigmentation");
  }

  if (description.includes("redness") || description.includes("inflammation")) {
    concerns.push("inflammation");
    if (description.includes("severe") || description.includes("burning")) {
      severity = "severe";
      needsMedicalAttention = true;
    }
  }

  if (
    description.includes("rosacea") ||
    description.includes("eczema") ||
    description.includes("psoriasis")
  ) {
    concerns.push("medical_condition");
    needsMedicalAttention = true;
    confidence = 0.6; // Lower confidence for medical conditions
  }

  if (
    description.includes("mole") ||
    description.includes("suspicious") ||
    description.includes("changing")
  ) {
    concerns.push("suspicious_lesion");
    needsMedicalAttention = true;
    confidence = 0.4; // Very low confidence, requires medical evaluation
  }

  // Age-related adjustments
  if (userAge && userAge > 30 && !concerns.includes("aging")) {
    concerns.push("prevention");
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (skinType === "oily") {
    recommendations.push("Use oil-free, non-comedogenic products");
    recommendations.push("Incorporate salicylic acid for pore cleansing");
  } else if (skinType === "dry") {
    recommendations.push("Use hydrating products with hyaluronic acid");
    recommendations.push("Apply moisturizer immediately after cleansing");
  } else if (skinType === "sensitive") {
    recommendations.push("Use fragrance-free, gentle formulations");
    recommendations.push("Patch test new products before full application");
  }

  if (concerns.includes("acne")) {
    recommendations.push("Consider retinoids or benzoyl peroxide");
    recommendations.push("Maintain consistent cleansing routine");
  }

  if (concerns.includes("aging")) {
    recommendations.push("Use products with retinol or peptides");
    recommendations.push("Apply broad-spectrum sunscreen daily");
  }

  if (needsMedicalAttention) {
    recommendations.push(
      "Consult with a dermatologist for professional evaluation"
    );
    recommendations.push("Avoid self-treatment for serious conditions");
  }

  const analysis = `Based on the description "${imageDescription}", identified skin type as ${skinType} with concerns: ${
    concerns.join(", ") || "none"
  }. Severity assessed as ${severity} with ${Math.round(
    confidence * 100
  )}% confidence.`;

  return {
    skinType,
    concerns,
    severity,
    confidence,
    recommendations,
    needsMedicalAttention,
    analysis,
  };
};
