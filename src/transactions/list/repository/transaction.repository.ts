import { TransactionModel } from "../../../database/models/transaction.model";
import "../../../database/init.dynamodb";
import dayjs from "dayjs";

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
      const startDate = dayjs(`${month}-01`).startOf("month"); // Primeiro dia do mês
      const endDate = dayjs(`${month}-01`).endOf("month"); // Último dia do mês

      const startDateFormatted = startDate.format("YYYY-MM-DD");
      const endDateFormatted = endDate.format("YYYY-MM-DD");

      console.log(`🔹 Searching transactions between: ${startDateFormatted} and ${endDateFormatted}`);

      // Busca as transações dentro do intervalo de datas
      const transactions = await TransactionModel.query("userId")
        .eq(userId)
        .where("createdAt")
        .between(startDateFormatted, endDateFormatted)
        .exec();

      return transactions;
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Failed to retrieve user balance.", error: error.message }),
      };
    }
  }
};
