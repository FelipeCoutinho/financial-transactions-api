import { TransactionModel } from "../../../database/models/transaction.model";
import "../../../database/init.dynamodb";

export const transactionRepository = {
  findById: async (userId: string) => {
    try {
      if (!userId) {
        throw new Error("Transaction ID is required.");
      }

      const transaction = await TransactionModel.query("userId").eq(userId).exec()
      return transaction || null;
    } catch (error) {
      console.error("Error fetching transaction by ID:", error);
      throw new Error("Failed to fetch transaction.");
    }
  },

  findAll: async ({ limit = 10, startKey }: { limit?: number; startKey?: any }) => {
    try {
      let query = TransactionModel.scan().limit(limit);

      if (startKey) {
        const parsedStartKey = JSON.parse(Buffer.from(startKey, "base64").toString("utf-8"));
        query = query.startAt(parsedStartKey); // Define o cursor de onde começar
      }

      const result = await query.exec();

      return {
        items: result,
        lastKey: result.lastKey ? Buffer.from(JSON.stringify(result.lastKey)).toString("base64") : null,
      };
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      throw new Error(error.message);
    }
  },

  count: async (): Promise<number> => {
    try {
      const countResult = await TransactionModel.scan().count().exec();
      console.log(countResult)
      return Number(countResult.count); // Retorna um número válido
    } catch (error: any) {
      console.error("Error counting transactions:", error);
      throw new Error(error.message);
    }
  },

  findByUserIdAndMonth: async (userId: string, month: string) => {
    try {
      // Define o primeiro dia do mês
      const startDate = new Date(`${month}-01T00:00:00.000Z`);

      // Calcula o último dia do mês corretamente
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      endDate.setUTCHours(23, 59, 59, 999); // Define para o final do último dia do mês

      console.log(`🔹 Searching transactions between: ${startDate.toISOString()} and ${endDate.toISOString()}`);

      // Busca as transações dentro do intervalo de datas
      const transactions = await TransactionModel.query("userId")
        .eq(userId)
        .where("createdAt")
        .between(startDate.toISOString(), endDate.toISOString())
        .exec();

      return transactions;
    } catch (error) {
      console.error("Error fetching transactions by user and month:", error);
      throw new Error("Failed to fetch transactions.");
    }
  }
};
