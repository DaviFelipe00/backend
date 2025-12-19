import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import apiRoutes from './routes/api.routes';
import { authMiddleware } from './middlewares/authMiddleware'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares Globais ---
app.use(cors()); // Permite acesso externo
app.use(express.json()); // Lê JSON

// --- Rotas ---

// Rota Pública (Health Check) - Ótima para saber se o server caiu sem precisar de senha
app.get('/', (req, res) => {
  res.send('🚀 API Financeira está rodando!');
});

// CORREÇÃO 2: Aplicando a segurança apenas nas rotas da API
// Agora, tudo que for /api/... vai passar pelo "porteiro" (authMiddleware) antes
app.use('/api', authMiddleware, apiRoutes);

// --- Tratamento de Erros Global (Recomendado) ---
// Adicione isso no final para evitar que o servidor trave silenciosamente
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🔥 Erro no servidor:', err);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`\n⚡ Servidor rodando em: http://localhost:${PORT}`);
  console.log(`👉 Rota segura: POST http://localhost:${PORT}/api/busca-vetorial`);
  console.log(`🔓 Rota pública: GET http://localhost:${PORT}/\n`);
});