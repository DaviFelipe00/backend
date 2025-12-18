import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import apiRoutes from './routes/api.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Permite que o n8n ou frontend acessem
app.use(express.json()); // Permite ler JSON no corpo da requisição

// Rotas
app.use('/api', apiRoutes);

// Rota de teste simples
app.get('/', (req, res) => {
  res.send('🚀 API Financeira está rodando!');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`\n⚡ Servidor rodando em: http://localhost:${PORT}`);
  console.log(`👉 Rota de busca: POST http://localhost:${PORT}/api/busca-vetorial\n`);
});