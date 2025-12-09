import * as v from 'valibot';

export const envSchema = v.object({
  GOOGLE_GENERATIVE_AI_API_KEY: v.string(),
  CORS_ORIGINS: v.optional(v.string()),
});

export const env = v.parse(envSchema, process.env);
