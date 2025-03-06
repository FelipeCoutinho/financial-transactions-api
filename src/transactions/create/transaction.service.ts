
import { v4 as uuidv4 } from "uuid";
import { CreateTransactionDto } from "./dto/create.transaction.dto";
import { transactionRepository } from "./repository/transaction.repository";



export const tranasactionService = {
  create: async (body: CreateTransactionDto) => {
    if (!body.amount || body.amount === 0) {
      throw new Error("amount cannot be zero.");
    }

    if (!body.description) {
      throw new Error("description is required.");
    }


    const transactionRes = await transactionRepository.create({
      id: uuidv4(),
      userId: body.userId,
      amount: body.amount,
      createdAt: new Date().toISOString(),
      description: body.description,
    })


    return transactionRes;
  }
}