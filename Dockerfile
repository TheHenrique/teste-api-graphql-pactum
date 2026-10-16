# Imagem com Node.js para rodar os testes de API
FROM node:22-slim

WORKDIR /app

# Instala as dependências primeiro (aproveita o cache do Docker)
COPY package.json package-lock.json ./
RUN npm ci

# Copia o restante do projeto (testes e contratos)
COPY . .

# Ao iniciar o container, roda os testes e gera o relatório
CMD ["npm", "test"]
