provider "aws" {
  region = "us-east-1" # Altere para a região desejada
}

resource "aws_dynamodb_table" "transactions" {
  name         = "transactions"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name            = "UserIdIndex"
    hash_key        = "userId"
    projection_type = "ALL"
  }
}

resource "aws_iam_role" "lambda_exec" {
  name = "lambda_exec_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_policy_attachment" "lambda_dynamodb_attach" {
  name       = "lambda_dynamodb_policy"
  roles      = [aws_iam_role.lambda_exec.name]
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

resource "aws_lambda_function" "transaction_lambda" {
  function_name    = "transactionService"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.createTransaction"
  runtime          = "nodejs18.x"
  filename         = "./deployment.zip"
  source_code_hash = filebase64sha256("./deployment.zip")
  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.transactions.name
    }
  }
}

resource "aws_api_gateway_rest_api" "transaction_api" {
  name        = "TransactionAPI"
  description = "API Gateway para o serviço de transações"
}

resource "aws_api_gateway_resource" "transactions" {
  rest_api_id = aws_api_gateway_rest_api.transaction_api.id
  parent_id   = aws_api_gateway_rest_api.transaction_api.root_resource_id
  path_part   = "transactions"
}

resource "aws_api_gateway_method" "post_transaction" {
  rest_api_id   = aws_api_gateway_rest_api.transaction_api.id
  resource_id   = aws_api_gateway_resource.transactions.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.transaction_api.id
  resource_id             = aws_api_gateway_resource.transactions.id
  http_method             = aws_api_gateway_method.post_transaction.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.transaction_lambda.invoke_arn
}

resource "aws_api_gateway_deployment" "transaction_api_deploy" {
  depends_on  = [aws_api_gateway_integration.lambda_integration]
  rest_api_id = aws_api_gateway_rest_api.transaction_api.id
  stage_name  = "prod"
}

resource "aws_lambda_permission" "api_gateway_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.transaction_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.transaction_api.execution_arn}/*/*"
}

output "api_url" {
  value = "${aws_api_gateway_deployment.transaction_api_deploy.invoke_url}/transactions"
}
