import { ListTransactionDto } from "./dto/list.transaction.dto";
import { transactionRepository } from "./repository/transaction.repository";

export class TransactionService {
  static async listOne(id: string) {
    try {
      if (!id) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Transaction ID is required." }),
        };
      }

      const transaction = await transactionRepository.findById(id);
      if (!transaction) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Transaction not found." }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(transaction),
      };
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Failed to retrieve transaction." }),
      };
    }
  }

  static async list(limit = 10, startKey?: string) {
    try {
      limit = Math.max(1, limit); // Evita limites inválidos

      // Obtém o total de itens para calcular páginas
      const totalItems = await transactionRepository.count();
      const totalPages = Math.ceil(totalItems / limit);

      // Busca os itens paginados
      const transactions = await transactionRepository.findAll({ limit, startKey });

      return {
        totalItems,
        totalPages,
        pageSize: limit,
        data: transactions.items,
        nextPageToken: transactions.lastKey, // Cursor para a próxima página
      };
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Failed to retrieve transactions.", error: error.message }),
      };
    }
  }

  static async getUserBalanceByMonth(userId: string, month: string) {
    try {
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(month)) {
        throw new Error("Invalid month format. Use YYYY-MM.");
      }

      // Busca todas as transações do usuário no mês especificado
      const transactions = await transactionRepository.findByUserIdAndMonth(userId, month);

      // Soma todos os valores (amount) das transações
      const balance = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);

      return balance;
    } catch (error) {
      console.error("🚨 Error calculating balance:", error);
      throw new Error("Failed to calculate user balance.");
    }
  }

}

