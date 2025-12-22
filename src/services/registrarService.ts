import { supabase } from '../config/supabase';
import { embeddingModel } from '../config/gemini';

interface GastoInput {
  amount: number;
  description: string;
  category: string;
  userId: string;
  date: string;
}

export const registrarService = {
  async executar(dados: GastoInput) {
    try {
      // 1. Inserir na tabela principal (Fonte da Verdade)
      const { data: gasto, error: erroFinanceiro } = await supabase
        .from('financeiro')
        .insert({
          amount: dados.amount,
          description: dados.description,
          category: dados.category,
          user_id: dados.userId,
          date: dados.date
        })
        .select()
        .single();

      if (erroFinanceiro) throw new Error(`Erro na tabela financeiro: ${erroFinanceiro.message}`);

      // 2. Gerar o Embedding da descrição (Vetorização)
      const result = await embeddingModel.embedContent(dados.description);
      const vetor = result.embedding.values;

      // 3. Inserir na tabela de busca semântica (Referência Normalizada)
      const { error: erroEmbedding } = await supabase
        .from('financeiro_embeddings')
        .insert({
          financeiro_id: gasto.id,
          embedding: vetor
        });

      if (erroEmbedding) throw new Error(`Erro na tabela embeddings: ${erroEmbedding.message}`);

      return { success: true, id: gasto.id };

    } catch (error: any) {
      console.error("❌ Erro no registrarService:", error);
      throw error;
    }
  }
};