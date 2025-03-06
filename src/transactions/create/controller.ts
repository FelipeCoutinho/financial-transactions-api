import { APIGatewayProxyHandler } from "aws-lambda";
import { tranasactionService } from "./transaction.service";



export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ message: "Request body is missing." }) };
    }

    const transactionData = JSON.parse(event.body);

    const transaction = await tranasactionService.create(transactionData)

    return { statusCode: 201, body: JSON.stringify(transaction) };
  } catch (error: any) {
    console.error("Error inserting transaction:", error);
    return { statusCode: 500, body: JSON.stringify({ message: "Internal Server Error", error: error.message }) };
  }
};
