FROM node:18-alpine

# Criar diretório da aplicação
WORKDIR /app

# Instalar dependências do sistema necessárias
RUN apk add --no-cache postgresql-client

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Expor a porta
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando para iniciar o servidor
CMD ["node", "server.js"] 