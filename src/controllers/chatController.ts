import { Request, Response } from 'express';
import { searchService } from '../services/searchService';

export const chatController = {
  async buscar(req: Request, res: Response): Promise<void> {
    try {
      const { text, userId } = req.body;

      // Validação básica
      if (!text || !userId) {
        res.status(400).json({ 
          error: 'Campos obrigatórios faltando: envie "text" e "userId".' 
        });
        return;
      }

      const resultado = await searchService.buscarGastos({ 
        query: text, 
        userId: userId 
      });

      res.json(resultado);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }
};