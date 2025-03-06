import { APIGatewayProxyHandler } from "aws-lambda";
import { TransactionService } from "./transaction.service";

export const listTransactions: APIGatewayProxyHandler = async (event) => {
  try {
    const limit = event.queryStringParameters?.limit
      ? parseInt(event.queryStringParameters.limit, 10)
      : 10;
    const startKey = event.queryStringParameters?.startKey || undefined;

    const transactions = await TransactionService.list(limit, startKey);

    return {
      statusCode: 200,
      body: JSON.stringify(transactions),
    };
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to retrieve transactions.", error: error.message }),
    };
  }
};

export const getTransactionByUserId: APIGatewayProxyHandler = async (event) => {
  try {
    if (!event.pathParameters || !event.pathParameters.userId) {
      return { statusCode: 400, body: JSON.stringify({ message: "User ID is required." }) };
    }

    const { userId } = event.pathParameters;
    const transactions = await TransactionService.listOne(userId);

    if (!transactions || transactions.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "No transactions found for this user." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(transactions),
    };
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to retrieve transactions.", error: error.message }),
    };
  }
};

export const getUserBalanceByMonth: APIGatewayProxyHandler = async (event) => {
  try {
    const { userId, month } = event.queryStringParameters || {};

    if (!userId || !month) {
      return { statusCode: 400, body: JSON.stringify({ message: "userId and month are required." }) };
    }

    // Chama o serviço para calcular o saldo
    const balance = await TransactionService.getUserBalanceByMonth(userId, month);

    return {
      statusCode: 200,
      body: JSON.stringify({ userId, month, balance }),
    };
  } catch (error: any) {
    console.error("🚨 Error fetching user balance:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to retrieve user balance.", error: error.message }),
    };
  }
};
