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

variable "image_tag_mutability" {
  description = "Image tag mutability setting"
  type        = string
  default     = "MUTABLE"
}

variable "scan_on_push" {
  description = "Scan images on push"
  type        = bool
  default     = true
}

variable "encryption_type" {
  description = "Encryption type for ECR repositories"
  type        = string
  default     = "AES256"
}

variable "keep_last_images" {
  description = "Number of images to keep in the repository"
  type        = number
  default     = 30
}

variable "untagged_image_expiry_days" {
  description = "Number of days to keep untagged images"
  type        = number
  default     = 7
}

variable "ecr_access_principals" {
  description = "List of IAM principals that can access ECR repositories"
  type        = list(string)
  default     = ["*"]
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

# 只增加这一个变量来控制是否创建社区仓库
variable "enable_community_repository" {
  description = "Whether to create the community service ECR repository"
  type        = bool
  default     = true
}