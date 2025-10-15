variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "comic-website"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

# VPC 变量
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "List of public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "List of private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

# RDS 变量
variable "database_name" {
  description = "Database name"
  type        = string
  default     = "comicdb"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "comicadmin"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "Database instance class"
  type        = string
  default     = "db.t3.micro"
}

# EKS 变量
variable "eks_instance_types" {
  description = "EKS node group instance types"
  type        = list(string)
  default     = ["t3.micro"]
}

variable "eks_cluster_version" {
  description = "EKS cluster version"
  type        = string
  default     = "1.28"
}

variable "eks_desired_size" {
  description = "EKS node group desired size"
  type        = number
  default     = 2
}

variable "eks_max_size" {
  description = "EKS node group maximum size"
  type        = number
  default     = 5
}

variable "eks_min_size" {
  description = "EKS node group minimum size"
  type        = number
  default     = 1
}

# S3 变量
variable "s3_versioning_enabled" {
  description = "Enable S3 versioning"
  type        = bool
  default     = true
}

variable "s3_lifecycle_days" {
  description = "S3 lifecycle days for non-current versions"
  type        = number
  default     = 30
}

# ECR 变量
variable "ecr_keep_images" {
  description = "Number of images to keep in ECR"
  type        = number
  default     = 30
}

variable "ecr_untagged_expiry_days" {
  description = "Days to keep untagged images in ECR"
  type        = number
  default     = 7
}

# Redis 相关变量
variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.small"
}

variable "redis_password" {
  description = "The password for the Redis cluster"
  type        = string
  sensitive   = true
  default     = ""
}

# Community Database Variables for RDS Module
variable "community_db_name" {
  description = "Name for the community database"
  type        = string
  default     = "communitydb"
}

variable "community_db_username" {
  description = "Username for community database access"
  type        = string
  default     = "community_user"
}

variable "community_db_password" {
  description = "Password for community database user"
  type        = string
  sensitive   = true
}