FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./
COPY tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build

# Define a variável de ambiente para o DynamoDB Local
ENV IS_OFFLINE=true

EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "start"]
