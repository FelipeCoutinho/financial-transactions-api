
import { APIGatewayProxyEvent } from "aws-lambda";
import { tranasactionService } from "../transaction.service";
import { handler } from "../controller";


jest.mock("./transaction.service");

describe("Lambda Handler", () => {
  const mockTransaction = { id: "123", amount: 100, description: "Test transaction" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 201 and the created transaction when request is valid", async () => {
    (tranasactionService.create as jest.Mock).mockResolvedValue(mockTransaction);

    const event: Partial<APIGatewayProxyEvent> = {
      body: JSON.stringify({ amount: 100, description: "Test transaction" }),
    };

    const response = await handler(event as APIGatewayProxyEvent);

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual(mockTransaction);
    expect(tranasactionService.create).toHaveBeenCalledWith({ amount: 100, description: "Test transaction" });
  });

  it("should return 400 if request body is missing", async () => {
    const event: Partial<APIGatewayProxyEvent> = {}; // Simula um evento sem body

    const response = await handler(event as APIGatewayProxyEvent);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: "Request body is missing." });
  });

  it("should return 500 if service throws an error", async () => {
    (tranasactionService.create as jest.Mock).mockRejectedValue(new Error("Database Error"));

    const event: Partial<APIGatewayProxyEvent> = {
      body: JSON.stringify({ amount: 100, description: "Test transaction" }),
    };

    const response = await handler(event as APIGatewayProxyEvent);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ message: "Internal Server Error", error: "Database Error" });
  });
});
