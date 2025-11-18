import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const medicalReferralTool = createTool({
  id: "medical-referral-check",
  description:
    "Check if skin condition requires medical attention and provide referral guidance",
  inputSchema: z.object({
    symptoms: z
      .array(z.string())
      .describe("Observed symptoms or skin conditions"),
    severity: z.enum(["mild", "moderate", "severe"]),
    duration: z
      .string()
      .optional()
      .describe("How long symptoms have persisted"),
    hasChanged: z
      .boolean()
      .optional()
      .describe("Whether condition has changed recently"),
    painLevel: z.number().min(0).max(10).optional().describe("Pain level 0-10"),
  }),
  outputSchema: z.object({
    needsMedicalAttention: z.boolean(),
    urgency: z.enum(["immediate", "urgent", "routine", "none"]),
    reason: z.string(),
    recommendations: z.array(z.string()),
    redFlags: z.array(z.string()),
    confidence: z.number().min(0).max(1),
  }),
  execute: async ({ context }) => {
    return await checkMedicalReferral(context);
  },
});

const checkMedicalReferral = async ({
  symptoms,
  severity,
  duration,
  hasChanged = false,
  painLevel = 0,
}: {
  symptoms: string[];
  severity: "mild" | "moderate" | "severe";
  duration?: string;
  hasChanged?: boolean;
  painLevel?: number;
}) => {
  let needsMedicalAttention = false;
  let urgency: "immediate" | "urgent" | "routine" | "none" = "none";
  let reason = "Condition appears manageable with over-the-counter skincare";
  const recommendations: string[] = [];
  const redFlags: string[] = [];
  let confidence = 0.8;

  // Critical red flags requiring immediate medical attention
  const immediateRedFlags = [
    "sudden onset severe rash",
    "difficulty breathing",
    "swelling of face or throat",
    "severe burning sensation",
    "signs of infection with fever",
    "rapidly changing mole",
    "bleeding lesion",
    "ulceration",
  ];

  // Urgent medical concerns
  const urgentConcerns = [
    "cystic acne",
    "severe eczema",
    "psoriasis",
    "rosacea",
    "melasma",
    "persistent redness",
    "suspicious mole",
    "new growth",
    "severe scarring",
    "hormonal acne in adults",
  ];

  // Routine dermatologist consultation
  const routineConcerns = [
    "moderate acne not responding to treatment",
    "persistent hyperpigmentation",
    "seborrheic dermatitis",
    "keratosis pilaris",
    "chronic dryness",
    "professional acne scar treatment",
    "anti-aging medical procedures",
  ];

  // Check symptoms against red flags
  const lowerSymptoms = symptoms.map((s) => s.toLowerCase());

  for (const symptom of lowerSymptoms) {
    // Immediate attention needed
    if (
      immediateRedFlags.some((flag) => symptom.includes(flag.toLowerCase()))
    ) {
      needsMedicalAttention = true;
      urgency = "immediate";
      reason =
        "Symptoms indicate potential serious medical condition requiring immediate evaluation";
      redFlags.push(`Immediate concern: ${symptom}`);
      confidence = 0.95;
      break;
    }

    // Urgent concerns
    if (
      urgentConcerns.some((concern) => symptom.includes(concern.toLowerCase()))
    ) {
      needsMedicalAttention = true;
      urgency = urgency === "none" ? "urgent" : urgency;
      reason =
        "Condition requires professional dermatological evaluation and treatment";
      redFlags.push(`Professional treatment needed: ${symptom}`);
      confidence = 0.9;
    }

    // Routine concerns
    if (
      routineConcerns.some((concern) => symptom.includes(concern.toLowerCase()))
    ) {
      if (urgency === "none") {
        needsMedicalAttention = true;
        urgency = "routine";
        reason =
          "Condition would benefit from professional dermatological consultation";
        confidence = 0.8;
      }
    }
  }

  // Severity-based evaluation
  if (severity === "severe") {
    needsMedicalAttention = true;
    if (urgency === "none") urgency = "urgent";
    reason = "Severe symptoms require professional medical evaluation";
    redFlags.push("Severe symptom severity level");
  } else if (severity === "moderate" && urgency === "none") {
    urgency = "routine";
    reason = "Moderate symptoms may benefit from professional guidance";
  }

  // Duration considerations
  if (duration) {
    if (duration.includes("month") || duration.includes("year")) {
      if (urgency === "none") {
        needsMedicalAttention = true;
        urgency = "routine";
        reason =
          "Chronic skin conditions should be evaluated by a dermatologist";
      }
    }
  }

  // Change in condition
  if (hasChanged) {
    if (urgency === "none") {
      needsMedicalAttention = true;
      urgency = "routine";
      reason =
        "Changes in existing skin conditions should be professionally evaluated";
    } else if (urgency === "routine") {
      urgency = "urgent";
      reason =
        "Rapidly changing skin conditions require prompt medical attention";
    }
    redFlags.push("Recent changes in skin condition");
  }

  // Pain level
  if (painLevel >= 7) {
    needsMedicalAttention = true;
    urgency = urgency === "none" ? "urgent" : urgency;
    redFlags.push("High pain level indicates need for medical evaluation");
  } else if (painLevel >= 4 && urgency === "none") {
    urgency = "routine";
  }

  // Generate recommendations based on urgency
  switch (urgency) {
    case "immediate":
      recommendations.push("Seek emergency medical care immediately");
      recommendations.push("Do not attempt self-treatment");
      recommendations.push(
        "Call emergency services if experiencing systemic symptoms"
      );
      break;

    case "urgent":
      recommendations.push(
        "Schedule dermatologist appointment within 1-2 weeks"
      );
      recommendations.push(
        "Avoid harsh skincare products until seen by doctor"
      );
      recommendations.push("Document symptoms with photos");
      recommendations.push("Consider urgent care if symptoms worsen");
      break;

    case "routine":
      recommendations.push(
        "Schedule dermatologist consultation within 1-3 months"
      );
      recommendations.push("Continue gentle skincare routine");
      recommendations.push("Keep diary of symptoms and triggers");
      recommendations.push(
        "Consider teledermatology consultation if available"
      );
      break;

    default:
      recommendations.push("Continue with appropriate skincare routine");
      recommendations.push("Monitor for any changes or worsening");
      recommendations.push(
        "Consider professional consultation if no improvement in 4-6 weeks"
      );
      break;
  }

  // Additional general recommendations
  if (!needsMedicalAttention) {
    recommendations.push("Use gentle, fragrance-free products");
    recommendations.push("Apply broad-spectrum sunscreen daily");
    recommendations.push("Maintain consistent routine");
    recommendations.push("Patch test new products before full use");
  }

  // Lower confidence for complex cases
  if (symptoms.length > 3 || (painLevel > 5 && severity === "severe")) {
    confidence -= 0.1;
  }

  return {
    needsMedicalAttention,
    urgency,
    reason,
    recommendations,
    redFlags,
    confidence,
  };
};
