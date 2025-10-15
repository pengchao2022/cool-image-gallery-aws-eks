terraform {
  required_providers {
    postgresql = {
      source  = "cyrilgdn/postgresql"
      version = "~> 1.21"
    }
  }
}

# PostgreSQL provider 配置 - 使用显式依赖
provider "postgresql" {
  # 这些值将在 apply 阶段动态设置
  host            = module.rds.rds_endpoint
  port            = module.rds.rds_port
  username        = module.rds.rds_username
  password        = var.db_password
  sslmode         = "require"
  connect_timeout = 15
  superuser       = false

  # 显式依赖 RDS 模块
  depends_on = [module.rds]
}