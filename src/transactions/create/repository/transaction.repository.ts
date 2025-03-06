import { TransactionModel } from "../../../database/models/transaction.model";
import "../../../database/init.dynamodb";


export const transactionRepository = {
  create: async (body: any) => {
    const transaction = await TransactionModel.create(body);
    return transaction;
  },

  findById: async (id: string) => {
    return await TransactionModel.get(id);
  },

  findAll: async () => {
    return await TransactionModel.scan().exec();
  }
};
