import { Router } from 'express';
import { chatController } from '../controllers/chatController';

const router = Router();

// Rota de Consulta (RAG)
router.post('/busca-vetorial', chatController.buscar);

// Rota de Inserção (Trabalho Pesado)
router.post('/registrar-gasto', chatController.registrar);

export default router;