// app/utils/openai.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.REPLIT_OPENAI_API_KEY,
});