import { createScorer } from "@mastra/core/scores";
import { z } from "zod";

// Scorer for evaluating skin analysis confidence
export const skinAnalysisConfidenceScorer = createScorer({
  name: "Skin Analysis Confidence Scorer",
  description:
    "Evaluates the confidence and reliability of skin analysis results",
  type: "agent",
})
  .preprocess(({ run }: { run: any }) => {
    // Extract the analysis from the run output
    const output = run.output[0]?.content;
    let analysis = null;

    try {
      // Try to parse JSON if it's structured output
      analysis = typeof output === "string" ? JSON.parse(output) : output;
    } catch {
      // If not JSON, treat as plain text
      analysis = { content: output };
    }

    return { analysis, originalOutput: output };
  })
  .generateScore(({ results }: { results: any }) => {
    const { analysis } = results;
    let score = 1.0;

    if (!analysis) return 0.0;

    // Check for medical red flags
    if (analysis.needsMedicalAttention) {
      score = 0.3; // Low confidence for medical cases
    }

    // Check severity level
    if (analysis.severity === "severe") {
      score = Math.min(score, 0.4);
    } else if (analysis.severity === "moderate") {
      score = Math.min(score, 0.7);
    }

    // Check if skin type could be determined
    if (!analysis.skinType || analysis.skinType === "unknown") {
      score = Math.min(score, 0.5);
    }

    // Check for suspicious lesions
    if (analysis.concerns?.includes("suspicious_lesion")) {
      score = 0.2; // Very low confidence
    }

    // Check for medical conditions
    if (analysis.concerns?.includes("medical_condition")) {
      score = Math.min(score, 0.3);
    }

    // Check confidence from the analysis itself
    if (analysis.confidence && typeof analysis.confidence === "number") {
      score = Math.min(score, analysis.confidence);
    }

    return Math.max(0, Math.min(1, score));
  })
  .generateReason(({ results, score }: { results: any; score: number }) => {
    const { analysis } = results;
    const reasons: string[] = [];

    if (score < 0.3) {
      reasons.push(
        "Medical attention required - low AI confidence for health conditions"
      );
    }

    if (analysis?.needsMedicalAttention) {
      reasons.push(
        "Analysis indicates need for professional medical evaluation"
      );
    }

    if (analysis?.severity === "severe") {
      reasons.push("Severe symptoms detected requiring expert assessment");
    }

    if (analysis?.concerns?.includes("suspicious_lesion")) {
      reasons.push("Suspicious lesions require dermatologist examination");
    }

    if (score >= 0.8) {
      reasons.push("High confidence in skin analysis results");
    } else if (score >= 0.6) {
      reasons.push("Moderate confidence with some uncertainties");
    } else if (score >= 0.4) {
      reasons.push("Low confidence - consider professional consultation");
    } else {
      reasons.push(
        "Very low confidence - medical evaluation strongly recommended"
      );
    }

    return reasons.join(". ");
  });

// Scorer for evaluating ingredient analysis confidence
export const ingredientAnalysisConfidenceScorer = createScorer({
  name: "Ingredient Analysis Confidence Scorer",
  description: "Evaluates the confidence and accuracy of ingredient analysis",
  type: "agent",
})
  .preprocess(({ run }: { run: any }) => {
    const output = run.output[0]?.content;
    let analysis = null;

    try {
      analysis = typeof output === "string" ? JSON.parse(output) : output;
    } catch {
      analysis = { content: output };
    }

    return { analysis };
  })
  .generateScore(({ results }: { results: any }) => {
    const { analysis } = results;

    if (!analysis) return 0.0;

    let score = 1.0;

    // Check overall compatibility
    if (
      analysis.overallCompatibility &&
      typeof analysis.overallCompatibility === "number"
    ) {
      score = Math.min(score, analysis.overallCompatibility);
    }

    // Check for warnings
    if (analysis.warnings && analysis.warnings.length > 0) {
      score = Math.min(score, 0.7 - analysis.warnings.length * 0.1);
    }

    // Check for interactions
    if (analysis.interactions && analysis.interactions.length > 0) {
      score = Math.min(score, 0.6 - analysis.interactions.length * 0.1);
    }

    // Check confidence from analysis
    if (analysis.confidence && typeof analysis.confidence === "number") {
      score = Math.min(score, analysis.confidence);
    }

    // Check for unknown ingredients
    if (analysis.analysis && Array.isArray(analysis.analysis)) {
      const unknownIngredients = analysis.analysis.filter(
        (ing: any) => ing.function === "Unknown"
      ).length;
      if (unknownIngredients > 0) {
        score = Math.min(score, 0.8 - unknownIngredients * 0.1);
      }
    }

    return Math.max(0, Math.min(1, score));
  })
  .generateReason(({ results, score }: { results: any; score: number }) => {
    const { analysis } = results;
    const reasons: string[] = [];

    if (analysis?.warnings && analysis.warnings.length > 0) {
      reasons.push(`${analysis.warnings.length} ingredient warnings detected`);
    }

    if (analysis?.interactions && analysis.interactions.length > 0) {
      reasons.push(
        `${analysis.interactions.length} ingredient interactions identified`
      );
    }

    if (score < 0.4) {
      reasons.push(
        "Multiple concerning ingredients or interactions - professional guidance recommended"
      );
    } else if (score < 0.6) {
      reasons.push("Some ingredient concerns noted - proceed with caution");
    } else if (score >= 0.8) {
      reasons.push("High confidence in ingredient analysis");
    }

    return reasons.length > 0
      ? reasons.join(". ")
      : "Ingredient analysis completed successfully";
  });

// Scorer for evaluating routine planning confidence
export const routinePlanningConfidenceScorer = createScorer({
  name: "Routine Planning Confidence Scorer",
  description:
    "Evaluates the safety and appropriateness of skincare routine recommendations",
  type: "agent",
})
  .preprocess(({ run }: { run: any }) => {
    const output = run.output[0]?.content;
    let analysis = null;

    try {
      analysis = typeof output === "string" ? JSON.parse(output) : output;
    } catch {
      analysis = { content: output };
    }

    return { analysis };
  })
  .generateScore(({ results }: { results: any }) => {
    const { analysis } = results;

    if (!analysis) return 0.0;

    let score = 1.0;

    // Check confidence from analysis
    if (analysis.confidence && typeof analysis.confidence === "number") {
      score = analysis.confidence;
    }

    // Check for warnings
    if (analysis.warnings && analysis.warnings.length > 2) {
      score = Math.min(score, 0.6);
    }

    // Check routine complexity vs user capability
    const morningSteps = analysis.morningRoutine?.length || 0;
    const eveningSteps = analysis.eveningRoutine?.length || 0;
    const totalSteps = morningSteps + eveningSteps;

    if (totalSteps > 10) {
      score = Math.min(score, 0.7); // Complex routines may be harder to follow
    }

    // Check for active ingredient combinations
    const hasRetinol = JSON.stringify(analysis)
      .toLowerCase()
      .includes("retinol");
    const hasAcids = JSON.stringify(analysis).toLowerCase().includes("acid");

    if (hasRetinol && hasAcids) {
      score = Math.min(score, 0.7); // Combination needs careful timing
    }

    return Math.max(0, Math.min(1, score));
  })
  .generateReason(({ results, score }: { results: any; score: number }) => {
    const { analysis } = results;
    const reasons: string[] = [];

    if (analysis?.warnings && analysis.warnings.length > 2) {
      reasons.push(
        "Multiple safety warnings noted - careful introduction required"
      );
    }

    if (score < 0.5) {
      reasons.push("Complex routine requiring professional guidance");
    } else if (score < 0.7) {
      reasons.push("Routine needs careful implementation and monitoring");
    } else {
      reasons.push(
        "Well-designed routine with appropriate safety considerations"
      );
    }

    return reasons.join(". ");
  });

// Master confidence scorer that evaluates overall system confidence
export const overallConfidenceScorer = createScorer({
  name: "Overall System Confidence Scorer",
  description:
    "Evaluates the overall confidence of the skincare analysis system",
  type: "agent",
})
  .preprocess(({ run }: { run: any }) => {
    const output = run.output[0]?.content;
    let analysis = null;

    try {
      analysis = typeof output === "string" ? JSON.parse(output) : output;
    } catch {
      analysis = { content: output };
    }

    return { analysis };
  })
  .generateScore(({ results }: { results: any }) => {
    const { analysis } = results;

    if (!analysis) return 0.0;

    let totalScore = 0;
    let scoreCount = 0;

    // Aggregate individual agent scores
    if (analysis.skinAnalysisScore) {
      totalScore += analysis.skinAnalysisScore;
      scoreCount++;
    }

    if (analysis.ingredientAnalysisScore) {
      totalScore += analysis.ingredientAnalysisScore;
      scoreCount++;
    }

    if (analysis.routinePlanningScore) {
      totalScore += analysis.routinePlanningScore;
      scoreCount++;
    }

    // Check for medical flags that override confidence
    if (
      analysis.needsMedicalAttention ||
      analysis.medicalReferral?.needsMedicalAttention
    ) {
      return 0.3; // Force low confidence for medical cases
    }

    // Check for critical safety issues
    if (analysis.criticalWarnings && analysis.criticalWarnings.length > 0) {
      return 0.2; // Very low confidence for safety issues
    }

    const avgScore = scoreCount > 0 ? totalScore / scoreCount : 0.5;

    // Apply penalties for complexity
    if (analysis.complexity === "high") {
      return Math.min(avgScore, 0.6);
    }

    return Math.max(0, Math.min(1, avgScore));
  })
  .generateReason(({ results, score }: { results: any; score: number }) => {
    const { analysis } = results;
    const reasons: string[] = [];

    if (
      analysis?.needsMedicalAttention ||
      analysis?.medicalReferral?.needsMedicalAttention
    ) {
      reasons.push(
        "Medical evaluation required - AI analysis cannot replace professional diagnosis"
      );
    }

    if (score < 0.3) {
      reasons.push("System recommends immediate medical consultation");
    } else if (score < 0.5) {
      reasons.push(
        "Low system confidence - professional guidance strongly advised"
      );
    } else if (score < 0.7) {
      reasons.push(
        "Moderate confidence - monitor results and consider professional input"
      );
    } else {
      reasons.push("High system confidence in analysis and recommendations");
    }

    return reasons.join(". ");
  });

export const scorers = {
  skinAnalysisConfidenceScorer,
  ingredientAnalysisConfidenceScorer,
  routinePlanningConfidenceScorer,
  overallConfidenceScorer,
};
