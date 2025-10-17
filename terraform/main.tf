# VPC 模块
module "vpc" {
  source = "./vpc"

  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
  project_name         = var.project_name
  environment          = var.environment
  common_tags          = local.common_tags
}

# S3 模块
module "s3" {
  source = "./s3"

  project_name           = var.project_name
  environment            = var.environment
  common_tags            = local.common_tags
  allowed_iam_principals = [module.iam.eks_node_group_role_arn]
}

# RDS 模块
module "rds" {
  source = "./rds"

  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  vpc_cidr           = module.vpc.vpc_cidr_block
  database_name      = var.database_name
  username           = var.db_username
  password           = var.db_password
  instance_class     = var.db_instance_class
  project_name       = var.project_name
  environment        = var.environment
  common_tags        = local.common_tags

  # 新增 Community 数据库变量
  community_db_name     = var.community_db_name
  community_db_username = var.community_db_username
  community_db_password = var.community_db_password
}

# ECR 模块
module "ecr" {
  source = "./ecr"

  project_name          = var.project_name
  environment           = var.environment
  common_tags           = local.common_tags
  ecr_access_principals = [module.iam.eks_node_group_role_arn]
}

# IAM 模块
module "iam" {
  source = "./iam"

  project_name  = var.project_name
  environment   = var.environment
  account_id    = data.aws_caller_identity.current.account_id
  aws_region    = var.aws_region
  s3_bucket_arn = module.s3.bucket_arn
  db_username   = var.db_username
  common_tags   = local.common_tags

  # OIDC provider URL 将在 EKS 创建后更新
  oidc_provider_url = try(replace(module.eks.cluster_oidc_issuer_url, "https://", ""), "")
}

# EKS 模块
module "eks" {
  source = "./eks"

  cluster_name        = "${var.project_name}-${var.environment}"
  node_group_name     = "${var.project_name}-nodegroup"
  vpc_id              = module.vpc.vpc_id
  private_subnet_ids  = module.vpc.private_subnet_ids
  eks_cluster_role    = module.iam.eks_cluster_role_arn
  eks_node_group_role = module.iam.eks_node_group_role_arn
  instance_types      = var.eks_instance_types
  desired_size        = var.eks_desired_size
  max_size            = var.eks_max_size
  min_size            = var.eks_min_size
  cluster_version     = var.eks_cluster_version
  project_name        = var.project_name
  environment         = var.environment
  aws_region          = var.aws_region
  common_tags         = local.common_tags
}

# Redis 模块 (新增)
module "redis" {
  source = "./redis"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  eks_cluster_sg_id  = module.eks.cluster_security_group_id
  redis_node_type    = var.redis_node_type
  common_tags        = local.common_tags
}

# 数据源
data "aws_caller_identity" "current" {}

# 本地变量
locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    CreatedAt   = timestamp()
  }
}

# EC2 模块
/*
module "ec2" {
  source = "./ec2"

  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  project_name      = var.project_name
  environment       = var.environment
  common_tags       = local.common_tags

  # 可选：自定义配置
  instance_type = "t3.small"
  volume_size   = 30
  custom_ports  = [8080, 3000] # 如果需要开放其他端口
}
*/