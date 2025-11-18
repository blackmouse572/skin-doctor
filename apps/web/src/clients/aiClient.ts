import { MastraClient } from '@mastra/client-js';
import { env } from '@/env';

export const aiClient = new MastraClient({
  baseUrl: env.PUBLIC_AI_API_URL,
});
