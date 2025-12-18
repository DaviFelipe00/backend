import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('❌ Falta a variável GEMINI_API_KEY no .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Importante: O modelo DEVE ser o mesmo que usamos para criar os dados (text-embedding-004)
export const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });