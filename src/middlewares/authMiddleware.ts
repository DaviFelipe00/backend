import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // 1. O porteiro procura o crachá no cabeçalho da requisição
  // O padrão de mercado é usar 'x-api-key' ou 'Authorization'
  const apiKey = req.headers['x-api-key'];
  
  // 2. O porteiro pega a lista de convidados (sua chave no .env)
  const validKey = process.env.INTERNAL_API_KEY;

  // 3. Verificação de segurança
  if (!validKey) {
    // Se você esqueceu de configurar o .env, o sistema falha seguro (ninguém entra)
    console.error("❌ ERRO CRÍTICO: INTERNAL_API_KEY não definida no .env");
    res.status(500).json({ error: 'Erro interno de configuração de segurança.' });
    return;
  }

  // 4. Se não tiver chave ou a chave for errada: BARRADO!
  if (!apiKey || apiKey !== validKey) {
    console.warn(`⛔ Acesso negado. IP: ${req.ip}`); // Log de tentativa de invasão
    res.status(401).json({ error: 'Acesso não autorizado. Chave de API inválida.' });
    return; // O return é crucial para parar a execução aqui!
  }

  // 5. Se passou, pode entrar!
  next();
};