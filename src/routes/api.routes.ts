import { Router } from 'express';
import { chatController } from '../controllers/chatController';

const router = Router();

// Rota POST para buscar dados
// URL final será: http://localhost:3000/api/busca-vetorial
router.post('/busca-vetorial', chatController.buscar);

export default router;