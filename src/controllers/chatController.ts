import { Request, Response } from 'express';
import { z } from 'zod';
import { searchService } from '../services/searchService';

// Schema de validação
const buscaSchema = z.object({
  text: z.string()
    .min(1, "O campo 'text' é obrigatório")
    .min(2, "A pergunta deve ter pelo menos 2 caracteres"),
  
  userId: z.string()
    .min(1, "O campo 'userId' é obrigatório")
    .uuid("O ID do usuário deve ser um UUID válido")
});

export const chatController = {
  async buscar(req: Request, res: Response): Promise<void> {
    try {
      // Validação
      const validacao = buscaSchema.safeParse(req.body);

      if (!validacao.success) {
        // CORREÇÃO: Usar .issues em vez de .errors
        const errosFormatados = validacao.error.issues.map(err => ({
          campo: err.path.join('.'),
          mensagem: err.message
        }));

        res.status(400).json({ 
          error: 'Dados inválidos', 
          detalhes: errosFormatados 
        });
        return; 
      }

      const { text, userId } = validacao.data;

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