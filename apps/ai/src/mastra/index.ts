import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { weatherWorkflow } from "./workflows/weather-workflow";
import { weatherAgent } from "./agents/weather-agent";
import {
  toolCallAppropriatenessScorer,
  completenessScorer,
  translationScorer,
} from "./scorers/weather-scorer";
import { analyzeSkincareRoutineWorkflow } from "./workflows/skincare-analysis-workflow";
import { skinAnalysisAgent } from "./agents/skin-analysis-agent";
import { skinAnalysisConfidenceScorer } from "./scorers/skincare-scorers";
import { supervisorAgent } from "./agents/supervisor-agent";
import { skinConditionAgent } from "./agents/skin-condition-agent";
import { routinePlanningAgent } from "./agents/routine-planning-agent";
import { ingredientAnalysisAgent } from "./agents/ingredient-analysis-agent";

export const mastra = new Mastra({
  workflows: { weatherWorkflow, analyzeSkincareRoutineWorkflow },
  agents: {
    weatherAgent,
    skinAnalysisAgent,
    supervisorAgent,
    skinConditionAgent,
    routinePlanningAgent,
    ingredientAnalysisAgent,
  },
  scorers: {
    toolCallAppropriatenessScorer,
    completenessScorer,
    translationScorer,
    skinAnalysisConfidenceScorer,
  },
  storage: new LibSQLStore({
    // stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
  telemetry: {
    // Telemetry is deprecated and will be removed in the Nov 4th release
    enabled: false,
  },
  observability: {
    // Enables DefaultExporter and CloudExporter for AI tracing
    default: { enabled: true },
  },
});
