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
  sensitive   = true
}

output "rds_database_name" {
  description = "RDS database name"
  value       = module.rds.db_name
}

# 密码输出
output "rds_password" {
  description = "RDS master password"
  value       = module.rds.db_password
  sensitive   = true
}

# OIDC 和 ALB Controller 相关输出
output "cluster_oidc_issuer_url" {
  description = "EKS cluster OIDC issuer URL"
  value       = module.eks.cluster_oidc_issuer_url
}

output "oidc_provider_arn" {
  description = "OIDC provider ARN"
  value       = module.eks.oidc_provider_arn
}

output "alb_controller_role_arn" {
  description = "ALB Controller IAM role ARN"
  value       = module.eks.alb_controller_role_arn
}

output "cluster_certificate_authority_data" {
  description = "EKS cluster certificate authority data"
  value       = module.eks.cluster_certificate_authority_data
}

output "backend_role_arn" {
  description = "Backend application IAM role ARN"
  value       = module.iam.app_backend_role_arn
}

output "frontend_role_arn" {
  description = "Frontend application IAM role ARN"
  value       = module.iam.app_frontend_role_arn
}

# S3 相关输出
output "s3_bucket_name" {
  description = "S3 bucket name for comic storage"
  value       = module.s3.bucket_name
}

output "s3_bucket_region" {
  description = "S3 bucket region"
  value       = var.aws_region
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = module.s3.bucket_arn
}

output "s3_bucket_domain_name" {
  description = "S3 bucket domain name"
  value       = module.s3.bucket_domain_name
}

# Redis 输出
output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = module.redis.redis_endpoint
}

output "redis_url" {
  description = "Redis connection URL"
  value       = module.redis.redis_url
}

output "redis_port" {
  description = "Redis port"
  value       = module.redis.redis_port
}
