import { Request, Response } from 'express';
import { z } from 'zod';
import { searchService } from '../services/searchService';
import { registrarService } from '../services/registrarService';

// 1. Schema para validação de BUSCA (RAG)
const buscaSchema = z.object({
  text: z.string().min(2, "A pergunta deve ter pelo menos 2 caracteres"),
  userId: z.string().uuid("ID de utilizador inválido")
});

// 2. Schema para validação de REGISTO (Escrita + Embedding)
const registroSchema = z.object({
  amount: z.number().positive("O valor deve ser maior que zero"),
  description: z.string().min(1, "A descrição não pode estar vazia"),
  category: z.string().min(1, "A categoria é obrigatória"),
  userId: z.string().uuid("ID de utilizador inválido"),
  date: z.string().datetime({ message: "Data deve estar no formato ISO 8601" })
});

export const chatController = {
  /**
   * Método para BUSCAR gastos e gerar resposta com IA (RAG)
   * Chamado quando o usuário faz uma pergunta sobre suas finanças
   */
  async buscar(req: Request, res: Response): Promise<void> {
    const validacao = buscaSchema.safeParse(req.body);

    if (!validacao.success) {
      res.status(400).json({ 
        error: 'Dados inválidos', 
        detalhes: validacao.error.issues.map(i => ({ campo: i.path[0], erro: i.message })) 
      });
      return;
    }

    try {
      // Aqui reativamos a chamada ao searchService
      const { text, userId } = validacao.data;
      const resultado = await searchService.buscarGastos({ 
        query: text, 
        userId: userId 
      });

      res.json(resultado);
    } catch (error: any) {
      console.error("🔥 Erro no chatController (buscar):", error);
      res.status(500).json({ error: error.message || 'Erro ao processar busca.' });
    }
  },

  /**
   * Método para REGISTRAR um novo gasto (Trabalho Pesado)
   * Chamado pelo n8n quando um novo gasto é identificado
   */
  async registrar(req: Request, res: Response): Promise<void> {
    const validacao = registroSchema.safeParse(req.body);

    if (!validacao.success) {
      res.status(400).json({ 
        error: 'Dados inválidos', 
        detalhes: validacao.error.issues.map(i => ({ campo: i.path[0], erro: i.message })) 
      });
      return;
    }

    try {
      const resultado = await registrarService.executar(validacao.data);
      res.status(201).json(resultado);
    } catch (error: any) {
      console.error("🔥 Erro no chatController (registrar):", error);
      res.status(500).json({ error: error.message || 'Erro ao registrar gasto.' });
    }
  }
};