# terraform/outputs.tf

# ECR 相关输出
output "backend_repository_url" {
  description = "Backend ECR repository URL"
  value       = module.ecr.backend_repository_url
}

output "frontend_repository_url" {
  description = "Frontend ECR repository URL"
  value       = module.ecr.frontend_repository_url
}

output "backend_repository_arn" {
  description = "Backend ECR repository ARN"
  value       = module.ecr.backend_repository_arn
}

output "frontend_repository_arn" {
  description = "Frontend ECR repository ARN"
  value       = module.ecr.frontend_repository_arn
}

# 其他你可能需要的输出
output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

# terraform/outputs.tf

# RDS 相关输出
output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = module.rds.db_endpoint
}

output "rds_port" {
  description = "RDS instance port"
  value       = module.rds.db_port
}

output "rds_username" {
  description = "RDS master username"
  value       = module.rds.db_username
  sensitive   = false
}

output "rds_database_name" {
  description = "RDS database name"
  value       = module.rds.db_name
}

# 添加密码输出
output "rds_password" {
  description = "RDS master password"
  value       = module.rds.db_password
  sensitive   = false
}