import dynamoose from "dynamoose";

const transactionSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true,
      required: true,
    },
    userId: {
      type: String,
      index: {
        type: 'global',
        name: "UserIdIndex",
      },
    },
    amount: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

export const TransactionModel = dynamoose.model("transactions", transactionSchema);
