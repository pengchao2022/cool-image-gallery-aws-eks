terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    postgresql = {
      source  = "cyrilgdn/postgresql"
      version = "~> 1.21"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

provider "postgresql" {
  # 这些值将在 RDS 创建后动态设置
  # 使用 null 值，Terraform 会在运行时处理依赖
  host     = null
  port     = null
  database = null
  username = null
  password = null
  sslmode  = "require"
}