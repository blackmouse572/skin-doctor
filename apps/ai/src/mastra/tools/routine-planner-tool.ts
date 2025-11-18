import { createTool } from "@mastra/core/tools";
import { z } from "zod";

interface ProductRecommendation {
  category: string;
  productType: string;
  keyIngredients: string[];
  purpose: string;
  timeOfUse: "morning" | "evening" | "both";
  frequency: string;
}

export const routinePlannerTool = createTool({
  id: "plan-skincare-routine",
  description: "Create personalized skincare routine and treatment plans",
  inputSchema: z.object({
    skinType: z.enum(["oily", "dry", "combination", "sensitive", "normal"]),
    skinConcerns: z.array(z.string()),
    currentProducts: z.array(z.string()).optional(),
    budget: z.enum(["budget", "mid-range", "luxury"]).optional(),
    timeAvailable: z.enum(["minimal", "moderate", "extensive"]).optional(),
    preferences: z
      .object({
        preferNatural: z.boolean().optional(),
        avoidFragrance: z.boolean().optional(),
        preferCrueltyFree: z.boolean().optional(),
      })
      .optional(),
  }),
  outputSchema: z.object({
    morningRoutine: z.array(
      z.object({
        step: z.number(),
        category: z.string(),
        productType: z.string(),
        keyIngredients: z.array(z.string()),
        purpose: z.string(),
        instructions: z.string(),
      })
    ),
    eveningRoutine: z.array(
      z.object({
        step: z.number(),
        category: z.string(),
        productType: z.string(),
        keyIngredients: z.array(z.string()),
        purpose: z.string(),
        instructions: z.string(),
      })
    ),
    weeklyTreatments: z.array(
      z.object({
        treatment: z.string(),
        frequency: z.string(),
        purpose: z.string(),
        keyIngredients: z.array(z.string()),
      })
    ),
    priorities: z.array(z.string()),
    timeline: z.string(),
    warnings: z.array(z.string()),
    confidence: z.number().min(0).max(1),
  }),
  execute: async ({ context }) => {
    return await planSkincareRoutine(context);
  },
});

const planSkincareRoutine = async ({
  skinType,
  skinConcerns,
  currentProducts = [],
  budget = "mid-range",
  timeAvailable = "moderate",
  preferences = {},
}: {
  skinType: "oily" | "dry" | "combination" | "sensitive" | "normal";
  skinConcerns: string[];
  currentProducts?: string[];
  budget?: "budget" | "mid-range" | "luxury";
  timeAvailable?: "minimal" | "moderate" | "extensive";
  preferences?: {
    preferNatural?: boolean;
    avoidFragrance?: boolean;
    preferCrueltyFree?: boolean;
  };
}) => {
  const morningRoutine: Array<{
    step: number;
    category: string;
    productType: string;
    keyIngredients: string[];
    purpose: string;
    instructions: string;
  }> = [];

  const eveningRoutine: Array<{
    step: number;
    category: string;
    productType: string;
    keyIngredients: string[];
    purpose: string;
    instructions: string;
  }> = [];

  const weeklyTreatments: Array<{
    treatment: string;
    frequency: string;
    purpose: string;
    keyIngredients: string[];
  }> = [];

  const warnings: string[] = [];
  const priorities: string[] = [];
  let confidence = 0.85;

  // Morning Routine Base
  morningRoutine.push({
    step: 1,
    category: "Cleansing",
    productType:
      skinType === "sensitive"
        ? "Gentle cream cleanser"
        : skinType === "oily"
        ? "Foaming cleanser"
        : "Gel cleanser",
    keyIngredients:
      skinType === "sensitive"
        ? ["Ceramides", "Hyaluronic Acid"]
        : skinType === "oily"
        ? ["Salicylic Acid", "Niacinamide"]
        : ["Glycerin", "Panthenol"],
    purpose: "Remove overnight buildup and prepare skin for products",
    instructions:
      "Use lukewarm water, massage gently for 30 seconds, rinse thoroughly",
  });

  // Add vitamin C for anti-aging or brightening concerns
  if (
    skinConcerns.includes("aging") ||
    skinConcerns.includes("hyperpigmentation")
  ) {
    morningRoutine.push({
      step: 2,
      category: "Antioxidant",
      productType: "Vitamin C serum",
      keyIngredients: ["L-Ascorbic Acid", "Magnesium Ascorbyl Phosphate"],
      purpose: "Protect against environmental damage and brighten skin",
      instructions:
        "Apply 3-4 drops to clean skin, wait 10 minutes before next step",
    });
    priorities.push("Introduce Vitamin C gradually to avoid irritation");
  }

  // Hydration step
  if (skinType === "dry" || skinType === "sensitive") {
    morningRoutine.push({
      step: morningRoutine.length + 1,
      category: "Hydration",
      productType: "Hydrating serum",
      keyIngredients: ["Hyaluronic Acid", "Ceramides", "Peptides"],
      purpose: "Provide deep hydration and strengthen skin barrier",
      instructions: "Apply to damp skin for better absorption",
    });
  } else if (skinType === "oily" && skinConcerns.includes("acne")) {
    morningRoutine.push({
      step: morningRoutine.length + 1,
      category: "Treatment",
      productType: "Niacinamide serum",
      keyIngredients: ["Niacinamide", "Zinc"],
      purpose: "Reduce oil production and minimize pores",
      instructions: "Apply thin layer, can be mixed with moisturizer",
    });
  }

  // Moisturizer
  morningRoutine.push({
    step: morningRoutine.length + 1,
    category: "Moisturizing",
    productType:
      skinType === "oily"
        ? "Lightweight gel moisturizer"
        : skinType === "dry"
        ? "Rich cream moisturizer"
        : "Lotion moisturizer",
    keyIngredients:
      skinType === "oily"
        ? ["Hyaluronic Acid", "Niacinamide"]
        : skinType === "dry"
        ? ["Ceramides", "Shea Butter", "Glycerin"]
        : ["Hyaluronic Acid", "Glycerin"],
    purpose: "Lock in hydration and create protective barrier",
    instructions: "Apply while skin is still slightly damp",
  });

  // Sunscreen (essential)
  morningRoutine.push({
    step: morningRoutine.length + 1,
    category: "Sun Protection",
    productType: "Broad-spectrum sunscreen SPF 30+",
    keyIngredients: ["Zinc Oxide", "Titanium Dioxide", "Chemical filters"],
    purpose: "Protect against UV damage and prevent aging",
    instructions: "Apply generously, reapply every 2 hours if outdoors",
  });

  // Evening Routine Base
  eveningRoutine.push({
    step: 1,
    category: "Cleansing",
    productType: "Double cleanse (oil cleanser + water cleanser)",
    keyIngredients: ["Cleansing oils", "Gentle surfactants"],
    purpose: "Remove makeup, sunscreen, and daily buildup",
    instructions: "Start with oil cleanser, follow with water-based cleanser",
  });

  // Treatment actives
  if (skinConcerns.includes("acne")) {
    if (skinType !== "sensitive") {
      eveningRoutine.push({
        step: 2,
        category: "Treatment",
        productType: "BHA/Salicylic Acid treatment",
        keyIngredients: ["Salicylic Acid"],
        purpose: "Exfoliate pores and reduce acne",
        instructions: "Start 2-3 times per week, gradually increase frequency",
      });
      priorities.push("Introduce salicylic acid slowly to avoid irritation");
    } else {
      eveningRoutine.push({
        step: 2,
        category: "Treatment",
        productType: "Azelaic Acid treatment",
        keyIngredients: ["Azelaic Acid"],
        purpose: "Gentle treatment for sensitive acne-prone skin",
        instructions: "Apply thin layer every other night initially",
      });
    }
  }

  if (skinConcerns.includes("aging") && !skinConcerns.includes("acne")) {
    eveningRoutine.push({
      step: eveningRoutine.length + 1,
      category: "Anti-aging",
      productType: "Retinol serum",
      keyIngredients: ["Retinol", "Retinyl Palmitate"],
      purpose: "Stimulate collagen production and reduce fine lines",
      instructions:
        "Start once per week, gradually increase to every other night",
    });
    priorities.push("Retinol is the gold standard for anti-aging - start slow");
    warnings.push("Always use sunscreen when using retinol products");
  }

  // Hydration and repair
  eveningRoutine.push({
    step: eveningRoutine.length + 1,
    category: "Hydration",
    productType: "Hydrating serum or essence",
    keyIngredients: ["Hyaluronic Acid", "Ceramides", "Peptides"],
    purpose: "Repair and hydrate skin overnight",
    instructions: "Apply to clean skin, layer under moisturizer",
  });

  // Night moisturizer
  eveningRoutine.push({
    step: eveningRoutine.length + 1,
    category: "Moisturizing",
    productType:
      skinType === "oily"
        ? "Lightweight night moisturizer"
        : "Rich night cream",
    keyIngredients:
      skinType === "oily"
        ? ["Hyaluronic Acid", "Niacinamide"]
        : ["Ceramides", "Peptides", "Natural Oils"],
    purpose: "Deep overnight hydration and repair",
    instructions: "Apply generously as the last step",
  });

  // Weekly treatments
  if (timeAvailable !== "minimal") {
    if (skinType !== "sensitive") {
      weeklyTreatments.push({
        treatment: "Exfoliating mask",
        frequency: "1-2 times per week",
        purpose: "Remove dead skin cells and improve texture",
        keyIngredients: ["AHA/BHA", "Enzymes"],
      });
    }

    if (skinType === "dry" || skinConcerns.includes("aging")) {
      weeklyTreatments.push({
        treatment: "Hydrating mask",
        frequency: "1-2 times per week",
        purpose: "Deep hydration and plumping",
        keyIngredients: ["Hyaluronic Acid", "Ceramides", "Collagen"],
      });
    }

    if (skinConcerns.includes("hyperpigmentation")) {
      weeklyTreatments.push({
        treatment: "Brightening mask",
        frequency: "1 time per week",
        purpose: "Even skin tone and reduce dark spots",
        keyIngredients: ["Vitamin C", "Kojic Acid", "Arbutin"],
      });
    }
  }

  // Set priorities based on concerns
  if (skinConcerns.includes("acne")) {
    priorities.unshift(
      "Consistent gentle cleansing and targeted acne treatments"
    );
  }
  if (skinConcerns.includes("aging")) {
    priorities.unshift("Sun protection and retinol introduction");
  }
  if (skinType === "sensitive") {
    priorities.unshift("Patch test all new products and introduce slowly");
    warnings.push(
      "Avoid products with alcohol, strong fragrances, or harsh actives"
    );
  }

  // Timeline expectations
  const timeline =
    "Expect to see initial improvements in 2-4 weeks, significant results in 6-12 weeks. Introduce new products one at a time with 1-2 weeks between additions.";

  // Adjust confidence based on complexity
  if (skinType === "sensitive" && skinConcerns.length > 2) {
    confidence -= 0.1;
    warnings.push(
      "Complex sensitive skin cases may require dermatologist consultation"
    );
  }

  if (preferences.avoidFragrance) {
    warnings.push("Always check ingredient lists for hidden fragrances");
  }

  return {
    morningRoutine,
    eveningRoutine,
    weeklyTreatments,
    priorities,
    timeline,
    warnings,
    confidence,
  };
};
