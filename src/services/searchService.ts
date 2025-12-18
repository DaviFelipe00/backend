import { supabase } from '../config/supabase';
import { embeddingModel } from '../config/gemini';

interface SearchParams {
  query: string;
  userId: string;
}

export const searchService = {
  async buscarGastos({ query, userId }: SearchParams) {
    try {
      console.log(`🔎 Buscando por: "${query}" para user: ${userId}`);

      // 1. Gerar Embedding da pergunta
      const result = await embeddingModel.embedContent(query);
      const vetor = result.embedding.values;

      // 2. Chamar a função RPC no Supabase
      const { data,bP_error: error } = await supabase.rpc('buscar_gastos', {
        query_embedding: vetor,
        match_threshold: 0.1, // Nível de similaridade (0.1 a 1.0)
        match_count: 1,       // Top 5 resultados
        p_user_id: userId
      });

      if (error) {
        throw new Error(`Erro no Supabase: ${error.message}`);
      }

      // 3. Retornar os dados
      return {
        success: true,
        data: data || [],
        // Retornamos também uma string formatada para facilitar o uso no Agente de IA depois
        contexto: data && data.length > 0 
          ? JSON.stringify(data) 
          : "Nenhum gasto encontrado com esses termos."
      };

    } catch (error: any) {
      console.error("❌ Erro no searchService:", error);
      throw new Error(error.message || "Erro ao processar busca.");
    }
  }
};