import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

// Input/Output schemas
const workflowInputSchema = z.object({
  skinConditionImage: z
    .string()
    .optional()
    .describe("Base64 encoded image of skin condition"),
  skinConcerns: z.string().optional().describe("Description of skin concerns"),
  currentProducts: z
    .array(z.string())
    .optional()
    .describe("List of current skincare products"),
  ageRange: z
    .string()
    .optional()
    .describe('Age range (e.g., "20-30", "30-40")'),
  skinType: z.string().optional().describe("Skin type if known"),
});

const workflowOutputSchema = z.object({
  finalRecommendation: z
    .string()
    .describe("Final comprehensive skincare recommendation"),
  confidenceScore: z
    .number()
    .describe("Overall confidence in the recommendation"),
  requiresMedicalAttention: z
    .boolean()
    .describe("Whether medical consultation is recommended"),
  medicalReferralReason: z
    .string()
    .optional()
    .describe("Reason for medical referral if needed"),
});

// Step 1: Analyze skin condition
const analyzeSkinStep = createStep({
  id: "analyze-skin",
  description: "Analyze skin condition and concerns",
  inputSchema: workflowInputSchema,
  outputSchema: z.object({
    skinAnalysis: z.string(),
    originalInput: workflowInputSchema,
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("skinAnalysisAgent");
    if (!agent) throw new Error("Skin analysis agent not found");

    const prompt = `Analyze the following skin condition:
    ${inputData.skinConditionImage ? "Image provided for analysis." : ""}
    Skin concerns: ${inputData.skinConcerns || "None specified"}
    Skin type: ${inputData.skinType || "Unknown"}
    Age range: ${inputData.ageRange || "Not specified"}
    
    Provide a detailed analysis of the skin condition and any concerns.`;

    const response = await agent.stream([{ role: "user", content: prompt }]);

    let output = "";

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      output += chunk;
    }

    return {
      skinAnalysis: output,
      originalInput: inputData,
    };
  },
});

// Step 2: Analyze product ingredients
const analyzeIngredientsStep = createStep({
  id: "analyze-ingredients",
  description: "Analyze current product ingredients",
  inputSchema: z.object({
    skinAnalysis: z.string(),
    originalInput: workflowInputSchema,
  }),
  outputSchema: z.object({
    skinAnalysis: z.string(),
    ingredientAnalysis: z.string(),
    originalInput: workflowInputSchema,
  }),
  execute: async ({ inputData, mastra }) => {
    if (
      !inputData.originalInput.currentProducts ||
      inputData.originalInput.currentProducts.length === 0
    ) {
      return {
        skinAnalysis: inputData.skinAnalysis,
        ingredientAnalysis: "No products provided for analysis.",
        originalInput: inputData.originalInput,
      };
    }

    const agent = mastra?.getAgent("ingredientAnalysisAgent");
    if (!agent) throw new Error("Ingredient analysis agent not found");

    const prompt = `Analyze the following skincare products for ingredients:
    Products: ${inputData.originalInput.currentProducts.join(", ")}
    
    Based on the skin analysis: ${inputData.skinAnalysis}
    
    Provide detailed ingredient analysis including any potential interactions or concerns.`;

    const response = await agent.stream([{ role: "user", content: prompt }]);

    let output = "";

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      output += chunk;
    }

    return {
      skinAnalysis: inputData.skinAnalysis,
      ingredientAnalysis: output,
      originalInput: inputData.originalInput,
    };
  },
});

// Step 3: Plan skincare routine
const planRoutineStep = createStep({
  id: "plan-routine",
  description: "Create personalized skincare routine",
  inputSchema: z.object({
    skinAnalysis: z.string(),
    ingredientAnalysis: z.string(),
    originalInput: workflowInputSchema,
  }),
  outputSchema: z.object({
    routinePlan: z.string(),
    previousAnalysis: z.object({
      skin: z.string(),
      ingredients: z.string(),
    }),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("routinePlanningAgent");
    if (!agent) throw new Error("Routine planning agent not found");

    const prompt = `Create a personalized skincare routine based on:
    Skin Analysis: ${inputData.skinAnalysis}
    Ingredient Analysis: ${inputData.ingredientAnalysis}
    Age Range: ${inputData.originalInput.ageRange || "Not specified"}
    
    Provide a comprehensive routine with specific product recommendations and application order.`;

    const response = await agent.stream([{ role: "user", content: prompt }]);

    let output = "";

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      output += chunk;
    }

    return {
      routinePlan: output,
      previousAnalysis: {
        skin: inputData.skinAnalysis,
        ingredients: inputData.ingredientAnalysis,
      },
    };
  },
});

// Step 4: Supervisor review and final recommendation
const supervisorReviewStep = createStep({
  id: "supervisor-review",
  description: "Final review and recommendation by supervisor agent",
  inputSchema: z.object({
    routinePlan: z.string(),
    previousAnalysis: z.object({
      skin: z.string(),
      ingredients: z.string(),
    }),
  }),
  outputSchema: workflowOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("supervisorAgent");
    if (!agent) throw new Error("Supervisor agent not found");

    const prompt = `Review and provide final recommendations based on all analyses:
    
    Skin Analysis: ${inputData.previousAnalysis.skin}
    Ingredient Analysis: ${inputData.previousAnalysis.ingredients}
    Routine Plan: ${inputData.routinePlan}
    
    Provide a final comprehensive recommendation with confidence assessment and determine if medical consultation is needed.
    
    Please format your response as a JSON object with the following keys: "finalRecommendation", "confidenceScore", "requiresMedicalAttention", "medicalReferralReason".`;

    const response = await agent.stream([{ role: "user", content: prompt }]);
    let output = "";
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      output += chunk;
    }
    try {
      // Gemini 2.5 Pro should return a JSON string that can be parsed
      const parsedResponse = JSON.parse(output);
      return workflowOutputSchema.parse(parsedResponse);
    } catch (error) {
      // Fallback for non-JSON or malformed JSON responses
      console.error("Failed to parse supervisor agent response:", error);
      return {
        finalRecommendation: output,
        confidenceScore: 0.2, // Low confidence due to parsing failure
        requiresMedicalAttention: true,
        medicalReferralReason:
          "AI system error during final review. Please consult a professional.",
      };
    }
  },
});

// Create the main workflow
const analyzeSkincareRoutineWorkflow = createWorkflow({
  id: "skincare-analysis-workflow",
  inputSchema: workflowInputSchema,
  outputSchema: workflowOutputSchema,
})
  .then(analyzeSkinStep)
  .then(analyzeIngredientsStep)
  .then(planRoutineStep)
  .then(supervisorReviewStep);

analyzeSkincareRoutineWorkflow.commit();

export { analyzeSkincareRoutineWorkflow };
