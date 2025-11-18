import { createTool } from "@mastra/core/tools";
import { z } from "zod";

interface IngredientAnalysis {
  ingredient: string;
  function: string;
  benefits: string[];
  suitableFor: string[];
  concerns: string[];
  concentration?: string;
  safetyRating: number;
}

export const ingredientAnalysisTool = createTool({
  id: "analyze-ingredients",
  description:
    "Analyze skincare product ingredients for effects, compatibility, and safety",
  inputSchema: z.object({
    ingredients: z.array(z.string()).describe("List of ingredients to analyze"),
    skinType: z
      .enum(["oily", "dry", "combination", "sensitive", "normal"])
      .optional(),
    skinConcerns: z
      .array(z.string())
      .optional()
      .describe("Current skin concerns"),
    existingProducts: z
      .array(z.string())
      .optional()
      .describe("Currently used products"),
  }),
  outputSchema: z.object({
    analysis: z.array(
      z.object({
        ingredient: z.string(),
        function: z.string(),
        benefits: z.array(z.string()),
        suitableFor: z.array(z.string()),
        concerns: z.array(z.string()),
        concentration: z.string().optional(),
        safetyRating: z.number().min(0).max(10),
      })
    ),
    overallCompatibility: z.number().min(0).max(1),
    warnings: z.array(z.string()),
    interactions: z.array(z.string()),
    recommendations: z.array(z.string()),
    confidence: z.number().min(0).max(1),
  }),
  execute: async ({ context }) => {
    return await analyzeIngredients(context);
  },
});

const analyzeIngredients = async ({
  ingredients,
  skinType,
  skinConcerns = [],
  existingProducts = [],
}: {
  ingredients: string[];
  skinType?: "oily" | "dry" | "combination" | "sensitive" | "normal";
  skinConcerns?: string[];
  existingProducts?: string[];
}) => {
  const ingredientDatabase: Record<
    string,
    Omit<IngredientAnalysis, "ingredient">
  > = {
    retinol: {
      function: "Anti-aging active",
      benefits: [
        "Reduces fine lines",
        "Improves skin texture",
        "Unclogs pores",
      ],
      suitableFor: ["normal", "oily", "combination"],
      concerns: [
        "Can cause irritation",
        "Increases sun sensitivity",
        "Not suitable during pregnancy",
      ],
      concentration: "0.25%-1%",
      safetyRating: 7,
    },
    "retinyl palmitate": {
      function: "Gentle retinoid derivative",
      benefits: ["Mild anti-aging effects", "Less irritating than retinol"],
      suitableFor: ["sensitive", "normal", "dry"],
      concerns: ["Less potent than retinol"],
      concentration: "0.5%-2%",
      safetyRating: 9,
    },
    "hyaluronic acid": {
      function: "Humectant",
      benefits: [
        "Deep hydration",
        "Plumps skin",
        "Suitable for all skin types",
      ],
      suitableFor: ["oily", "dry", "combination", "sensitive", "normal"],
      concerns: [],
      concentration: "0.1%-2%",
      safetyRating: 10,
    },
    "salicylic acid": {
      function: "Beta hydroxy acid (BHA)",
      benefits: ["Exfoliates pores", "Reduces acne", "Improves skin texture"],
      suitableFor: ["oily", "combination"],
      concerns: [
        "Can be drying",
        "May cause irritation",
        "Increases sun sensitivity",
      ],
      concentration: "0.5%-2%",
      safetyRating: 8,
    },
    "glycolic acid": {
      function: "Alpha hydroxy acid (AHA)",
      benefits: [
        "Surface exfoliation",
        "Improves skin brightness",
        "Reduces hyperpigmentation",
      ],
      suitableFor: ["normal", "oily", "combination"],
      concerns: [
        "Can cause irritation",
        "Increases sun sensitivity",
        "Not for sensitive skin",
      ],
      concentration: "5%-15%",
      safetyRating: 7,
    },
    niacinamide: {
      function: "Vitamin B3",
      benefits: [
        "Reduces oil production",
        "Minimizes pores",
        "Calms inflammation",
      ],
      suitableFor: ["oily", "combination", "sensitive", "normal"],
      concerns: ["May cause flushing at high concentrations"],
      concentration: "2%-10%",
      safetyRating: 9,
    },
    "vitamin c": {
      function: "Antioxidant",
      benefits: [
        "Brightens skin",
        "Protects against environmental damage",
        "Boosts collagen",
      ],
      suitableFor: ["normal", "dry", "combination"],
      concerns: ["Can oxidize", "May cause irritation", "Unstable in light"],
      concentration: "10%-20%",
      safetyRating: 8,
    },
    "ascorbic acid": {
      function: "Pure Vitamin C",
      benefits: ["Potent antioxidant", "Brightens skin", "Anti-aging"],
      suitableFor: ["normal", "dry"],
      concerns: ["Can be irritating", "pH dependent", "Unstable"],
      concentration: "5%-20%",
      safetyRating: 7,
    },
    ceramides: {
      function: "Barrier repair",
      benefits: [
        "Strengthens skin barrier",
        "Prevents moisture loss",
        "Soothes irritation",
      ],
      suitableFor: ["dry", "sensitive", "normal", "combination"],
      concerns: [],
      concentration: "1%-5%",
      safetyRating: 10,
    },
    peptides: {
      function: "Anti-aging active",
      benefits: ["Stimulates collagen", "Firms skin", "Reduces wrinkles"],
      suitableFor: ["normal", "dry", "combination"],
      concerns: ["Expensive", "Results take time"],
      concentration: "1%-10%",
      safetyRating: 9,
    },
    "benzoyl peroxide": {
      function: "Antibacterial agent",
      benefits: [
        "Kills acne bacteria",
        "Reduces inflammation",
        "Prevents new breakouts",
      ],
      suitableFor: ["oily", "combination"],
      concerns: ["Can bleach fabric", "May cause dryness", "Can be irritating"],
      concentration: "2.5%-10%",
      safetyRating: 7,
    },
    "zinc oxide": {
      function: "Physical sunscreen",
      benefits: ["Broad spectrum protection", "Gentle", "Anti-inflammatory"],
      suitableFor: ["sensitive", "normal", "dry", "oily", "combination"],
      concerns: ["Can leave white cast", "Thick texture"],
      concentration: "5%-25%",
      safetyRating: 10,
    },
    "alcohol denat": {
      function: "Solvent/preservative",
      benefits: ["Fast absorption", "Antimicrobial"],
      suitableFor: [],
      concerns: ["Very drying", "Can damage barrier", "Irritating"],
      concentration: "Variable",
      safetyRating: 3,
    },
    fragrance: {
      function: "Scent",
      benefits: ["Pleasant smell"],
      suitableFor: ["normal"],
      concerns: [
        "Common allergen",
        "Can cause irritation",
        "Unnecessary for skincare",
      ],
      concentration: "Variable",
      safetyRating: 4,
    },
  };

  const analysis: IngredientAnalysis[] = [];
  const warnings: string[] = [];
  const interactions: string[] = [];
  const recommendations: string[] = [];
  let overallCompatibility = 1.0;
  let confidence = 0.9;

  // Analyze each ingredient
  for (const ingredient of ingredients) {
    const cleanIngredient = ingredient.toLowerCase().trim();
    const data = ingredientDatabase[cleanIngredient];

    if (data) {
      const ingredientAnalysis: IngredientAnalysis = {
        ingredient,
        ...data,
      };

      // Check compatibility with skin type
      if (skinType && !data.suitableFor.includes(skinType)) {
        warnings.push(`${ingredient} may not be suitable for ${skinType} skin`);
        overallCompatibility -= 0.1;
      }

      // Check for concerning ingredients
      if (data.safetyRating < 6) {
        warnings.push(`${ingredient} has potential safety concerns`);
        overallCompatibility -= 0.15;
      }

      analysis.push(ingredientAnalysis);
    } else {
      // Unknown ingredient
      analysis.push({
        ingredient,
        function: "Unknown",
        benefits: [],
        suitableFor: [],
        concerns: ["Ingredient data not available"],
        safetyRating: 5,
      });
      confidence -= 0.1;
      warnings.push(`Limited data available for ${ingredient}`);
    }
  }

  // Check for common interactions
  const hasRetinol = ingredients.some((i) =>
    i.toLowerCase().includes("retinol")
  );
  const hasAHA = ingredients.some(
    (i) =>
      i.toLowerCase().includes("glycolic") || i.toLowerCase().includes("lactic")
  );
  const hasBHA = ingredients.some((i) => i.toLowerCase().includes("salicylic"));
  const hasVitaminC = ingredients.some(
    (i) =>
      i.toLowerCase().includes("vitamin c") ||
      i.toLowerCase().includes("ascorbic")
  );
  const hasBenzoylPeroxide = ingredients.some((i) =>
    i.toLowerCase().includes("benzoyl peroxide")
  );

  if (hasRetinol && (hasAHA || hasBHA)) {
    interactions.push(
      "Retinol + AHA/BHA: May increase irritation. Use on alternating days."
    );
    overallCompatibility -= 0.2;
  }

  if (hasVitaminC && hasRetinol) {
    interactions.push(
      "Vitamin C + Retinol: Use Vitamin C in AM, Retinol in PM."
    );
  }

  if (hasBenzoylPeroxide && hasRetinol) {
    interactions.push(
      "Benzoyl Peroxide + Retinol: Can cause severe irritation. Avoid combining."
    );
    overallCompatibility -= 0.3;
  }

  // Generate recommendations based on skin type and concerns
  if (skinType === "sensitive") {
    recommendations.push("Patch test new products before full application");
    recommendations.push("Introduce active ingredients gradually");
  }

  if (skinType === "dry") {
    recommendations.push("Layer hydrating products before actives");
    recommendations.push("Use occlusive moisturizers to seal in moisture");
  }

  if (skinConcerns.includes("acne") && skinType === "sensitive") {
    recommendations.push("Consider gentler alternatives like azelaic acid");
  }

  if (hasRetinol || hasAHA || hasBHA) {
    recommendations.push("Always use broad-spectrum sunscreen during the day");
    recommendations.push(
      "Start with lower concentrations and gradually increase"
    );
  }

  // Ensure compatibility stays within bounds
  overallCompatibility = Math.max(0, Math.min(1, overallCompatibility));
  confidence = Math.max(0, Math.min(1, confidence));

  return {
    analysis,
    overallCompatibility,
    warnings,
    interactions,
    recommendations,
    confidence,
  };
};
