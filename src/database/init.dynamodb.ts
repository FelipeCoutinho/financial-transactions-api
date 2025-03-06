import dynamoose from "dynamoose";
import * as models from "./models/transaction.model"; // Importa todas as models automaticamente

// Configuração do Dynamoose para apontar para LocalStack
const isOffline = process.env.IS_OFFLINE || true;

if (isOffline) {
  const dynamoDbEndpoint = process.env.DYNAMODB_ENDPOINT || "http://localhost:4566";
  dynamoose.aws.ddb.local(dynamoDbEndpoint);
}

// Lista todas as models importadas e garante que elas sejam inicializadas
const initializeTables = async () => {
  try {
    for (const modelName in models) {
      const model = (models as any)[modelName];
      if (model && typeof model.scan === "function") {
        await model.scan().exec(); // Força a criação das tabelas
        console.log(`Tabela criada para: ${modelName}`);
      }
    }
    console.log("Todas as tabelas foram criadas com sucesso!");
  } catch (error) {
    console.error("Erro ao criar tabelas:", error);
  }
};

// Executa a criação das tabelas 
initializeTables();
