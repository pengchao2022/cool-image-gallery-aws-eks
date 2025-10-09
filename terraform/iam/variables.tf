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

variable "account_id" {
  description = "AWS account ID"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "s3_bucket_arn" {
  description = "S3 bucket ARN for comic storage"
  type        = string
}

variable "oidc_provider_url" {
  description = "EKS OIDC provider URL"
  type        = string
  default     = ""
}

variable "db_username" {
  description = "Database username for RDS connection"
  type        = string
  default     = "comicadmin"
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "comic-website"
    Environment = "prod"
    ManagedBy   = "terraform"
  }
}