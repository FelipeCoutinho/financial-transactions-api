provider "aws" {
  access_key                  = "test"
  secret_key                  = "test"
  region                      = "us-east-1"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    lambda     = "http://localhost:4566"
    dynamodb   = "http://localhost:4566"
    apigateway = "http://localhost:4566"
    iam        = "http://localhost:4566"
  }
}

# 🔹 Criar Role IAM para Lambda com permissões de log
resource "aws_iam_role" "lambda_exec" {
  name = "lambda_exec_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# 🔹 Adicionar permissões para a Lambda gravar logs
resource "aws_iam_policy_attachment" "lambda_logs" {
  name       = "lambda_logs"
  roles      = [aws_iam_role.lambda_exec.name]
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "null_resource" "build_lambda" {
  provisioner "local-exec" {
    command = "cd ${path.module}/../../src && npm install && npm run build && zip -r ../lambda.zip ."
  }
}


# 🔹 Criar a Lambda (com caminho do handler correto)
resource "aws_lambda_function" "transaction_lambda" {
  depends_on = [null_resource.build_lambda]

  function_name = "TransactionLambda"
  role          = aws_iam_role.lambda_exec.arn
  runtime       = "nodejs16.x"
  handler       = "dist/main.handler"

  filename         = "${path.module}/lambda.zip"
  source_code_hash = filebase64sha256("${path.module}/lambda.zip")

  timeout     = 30
  memory_size = 256
}

# 🔹 Permissão para API Gateway chamar a Lambda
resource "aws_lambda_permission" "apigateway_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.transaction_lambda.function_name
  principal     = "apigateway.amazonaws.com"
}

resource "null_resource" "debug_lambda_path" {
  provisioner "local-exec" {
    command = "echo '${path.module}/lambda.zip'"
  }
}

# 🔹 API Gateway para acessar a Lambda
resource "aws_api_gateway_rest_api" "transaction_api" {
  name        = "TransactionAPI"
  description = "API para transações financeiras"
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
  rest_api_id = aws_api_gateway_rest_api.transaction_api.id
  resource_id = aws_api_gateway_resource.transactions.id
  http_method = aws_api_gateway_method.post_transaction.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.transaction_lambda.invoke_arn
}

# 🔹 Implantação e estágio da API Gateway
resource "aws_api_gateway_deployment" "transaction_api_deploy" {
  depends_on  = [aws_api_gateway_integration.lambda_integration]
  rest_api_id = aws_api_gateway_rest_api.transaction_api.id

  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.transaction_api))
  }
}

resource "aws_api_gateway_stage" "transaction_stage" {
  deployment_id = aws_api_gateway_deployment.transaction_api_deploy.id
  rest_api_id   = aws_api_gateway_rest_api.transaction_api.id
  stage_name    = "dev"
}

# 🔹 URL de saída da API Gateway no LocalStack
output "api_url" {
  value = "http://localhost:4566/restapis/${aws_api_gateway_rest_api.transaction_api.id}/dev/_user_request_/transactions"
}
