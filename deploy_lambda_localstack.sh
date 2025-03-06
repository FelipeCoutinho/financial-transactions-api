#!/bin/bash

# Parar a execução em caso de erro
set -e

# 1️⃣ Compilar TypeScript para gerar arquivos JavaScript
echo "🔹 Compilando TypeScript..."
npx tsc

# 2️⃣ Criar o arquivo ZIP contendo a Lambda e suas dependências
echo "🔹 Criando pacote ZIP da Lambda..."
zip -r infra/local/lambda.zip dist/ node_modules package.json package-lock.json


# 3️⃣ Verificar se o arquivo ZIP foi criado corretamente
echo "🔹 Verificando o pacote ZIP..."
ls -lh infra/local/lambda.zip

# 4️⃣ Parar e remover containers do LocalStack
echo "🔹 Reiniciando o LocalStack..."
docker-compose -f docker/docker-compose.yml down
sleep 2

docker-compose -f docker/docker-compose.yml up -d
sleep 5

# 5️⃣ Testar se o LocalStack está rodando corretamente
echo "🔹 Verificando serviços no LocalStack..."
curl http://localhost:4566/_localstack/health 

# 6️⃣ Remover estado antigo do Terraform
echo "🔹 Limpando estado antigo do Terraform..."
cd infra/local
rm -rf .terraform terraform.tfstate terraform.tfstate.backup

# 7️⃣ Inicializar Terraform
echo "🔹 Inicializando Terraform..."
terraform init

# 8️⃣ Aplicar Terraform e provisionar infraestrutura
echo "🔹 Aplicando Terraform..."
terraform apply -auto-approve

# 9️⃣ Testar a Lambda no LocalStack
echo "🔹 Testando Lambda diretamente..."
aws lambda invoke --function-name TransactionLambda --endpoint-url http://localhost:4566 response.json
cat response.json

echo "✅ Deploy finalizado com sucesso!"
cd ..
cd ..

serverless offline