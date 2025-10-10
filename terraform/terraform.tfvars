aws_region   = "us-east-1"
project_name = "comic-website"
environment  = "prod"

# 数据库密码
db_password = "your-secure-password-here"

# VPC 配置
vpc_cidr             = "10.0.0.0/16"
public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
private_subnet_cidrs = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
availability_zones   = ["us-east-1a", "us-east-1b", "us-east-1c"]

# EKS 配置
eks_instance_types  = ["t3.micro"]
eks_desired_size    = 5
eks_max_size        = 7
eks_min_size        = 5
eks_cluster_version = "1.28"

# RDS 配置
db_instance_class = "db.t3.micro"
database_name     = "comicdb"
db_username       = "comicadmin"

# S3 配置
s3_versioning_enabled = true
s3_lifecycle_days     = 30

# ECR 配置
ecr_keep_images          = 30
ecr_untagged_expiry_days = 7