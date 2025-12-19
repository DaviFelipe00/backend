import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('❌ Falta a variável GEMINI_API_KEY no .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Modelo para criar vetores (Embeddings)
export const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

// NOVO: Modelo para gerar texto/respostas (Rápido e Barato)
export const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });