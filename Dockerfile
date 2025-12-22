# Estágio 1: Build
FROM node:20-slim AS builder
WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./
RUN npm install

# Copia o restante do código e compila o TypeScript
COPY . .
RUN npm run build

# Estágio 2: Produção
FROM node:20-slim
WORKDIR /app

# Copia apenas o necessário do estágio de build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Remove dependências de desenvolvimento para economizar espaço
RUN npm prune --production

# Expõe a porta que sua API usa
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["node", "dist/server.js"]