import { supabase } from '../config/supabase';
import { embeddingModel, chatModel } from '../config/gemini'; // <--- Importamos o chatModel

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

      // 2. Buscar no Supabase (RPC)
      const { data, error } = await supabase.rpc('buscar_gastos', {
        query_embedding: vetor,
        match_threshold: 0.1, // Pode ajustar se achar que está trazendo coisa demais/de menos
        match_count: 5,       // Traz os 5 gastos mais relevantes
        p_user_id: userId
      });

      if (error) {
        throw new Error(`Erro no Supabase: ${error.message}`);
      }

      // 3. Montar o "Dossiê" para a IA
      const gastosEncontrados = data || [];
      
      // Se não achou nada, já devolvemos uma resposta padrão sem gastar IA
      if (gastosEncontrados.length === 0) {
        return {
          success: true,
          data: [],
          mensagem: "Não encontrei nenhum gasto relacionado a isso no seu histórico."
        };
      }

      // 4. FULL RAG: Gerar a resposta com IA
      const prompt = `
        Atue como um consultor financeiro pessoal, direto e amigável.
        
        PERGUNTA DO USUÁRIO: "${query}"
        
        DADOS ENCONTRADOS NO BANCO (JSON):
        ${JSON.stringify(gastosEncontrados)}
        
        INSTRUÇÕES:
        - Analise os dados acima para responder à pergunta.
        - Se a pergunta for sobre "quanto gastei", some os valores.
        - Cite exemplos específicos ("ex: R$ 50 no Uber dia 12").
        - Responda em português do Brasil.
        - Seja conciso (máximo 3 frases).
      `;

      const respostaIA = await chatModel.generateContent(prompt);
      const textoFinal = respostaIA.response.text();

      // 5. Retornar tudo pronto
      return {
        success: true,
        data: gastosEncontrados, // Mantemos os dados brutos se precisar auditar
        mensagem: textoFinal     // A resposta pronta para exibir no WhatsApp/Telegram
      };

    } catch (error: any) {
      console.error("❌ Erro no searchService:", error);
      throw new Error(error.message || "Erro ao processar busca.");
    }
  }
};