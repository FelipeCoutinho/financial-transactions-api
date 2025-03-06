# Transaction API

## Visão Geral
A **Transaction API** é um sistema serverless para gerenciamento de transações financeiras, utilizando **AWS Lambda**, **DynamoDB**, **RDS (PostgreSQL/MySQL)** e **DynamoDB Streams** para sincronização de dados entre os bancos.

## Funcionalidades
- Registrar transações no DynamoDB
- Listar transações
- Consultar saldo de um usuário por mês (`YYYY-MM`)
- Streaming de transações do DynamoDB para o RDS para análise avançada
- Infraestrutura como Código (IaC) com Terraform
- Testes automatizados com Jest

## Tecnologias Utilizadas
- **Node.js** com TypeScript
- **AWS Lambda** (Microsserviço Serverless)
- **AWS API Gateway** (Interface HTTP)
- **Amazon DynamoDB** (Banco de dados NoSQL)
- **Amazon RDS** (Banco de dados relacional para Analytics)
- **DynamoDB Streams** (Captura de eventos de transação)
- **Terraform** (Provisionamento de infraestrutura AWS)
- **Jest & Supertest** (Testes automatizados)

## Estrutura do Projeto
A estrutura do projeto segue um padrão modularizado para melhor organização e escalabilidade.

```bash
/transaction-api
│── src
│   ├── database
│   ├── transactions
│   │   ├── create
│   │   │   ├── dto
│   │   │   ├── repository
│   │   │   ├── controller.ts
│   │   │   ├── transaction.service.ts
│   │   ├── list
│   │   │   ├── dto
│   │   │   ├── repository
│   │   │   ├── controller.ts
│   │   │   ├── transaction.service.ts
│   │   ├── test
│   │   │   ├── handler.spec.ts
│── .env
│── .gitignore
```

## Execução do Projeto
Para executar o projeto localmente, siga os passos abaixo:

### 1. Suba os containers necessários
```sh
./deploy_lambda_localstack.sh
```
Esse script irá:
- Rodar o **Docker Compose**
- Iniciar o **LocalStack** (emulação AWS local)
- Compilar o código TypeScript (`tsc`)
- Criar a pasta `dist`
- Criar o pacote `.zip`
- Iniciar o **Serverless Offline** para execução local

### 2. Testar as APIs
```sh
npm test
```

## Deploy
O deploy da **Transaction API** é gerenciado pelo **Terraform**. Para provisionar a infraestrutura na AWS, execute:

```sh
cd infra/terraform
terraform init
terraform apply
```

Isso criará os recursos necessários na AWS, incluindo as funções Lambda, DynamoDB, API Gateway e RDS.

## Contato
Caso tenha dúvidas ou precise de suporte, entre em contato com o mantenedor do projeto.

---
**Autor:** Felipe Coutinho

