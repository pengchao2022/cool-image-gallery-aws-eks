output "backend_repository_url" {
  description = "Backend ECR repository URL"
  value       = aws_ecr_repository.backend.repository_url
}

output "frontend_repository_url" {
  description = "Frontend ECR repository URL"
  value       = aws_ecr_repository.frontend.repository_url
}

output "community_repository_url" {
  description = "Community ECR repository URL"
  value       = aws_ecr_repository.community.repository_url
}

output "backend_repository_arn" {
  description = "Backend ECR repository ARN"
  value       = aws_ecr_repository.backend.arn
}

output "frontend_repository_arn" {
  description = "Frontend ECR repository ARN"
  value       = aws_ecr_repository.frontend.arn
}

output "community_repository_arn" {
  description = "Community ECR repository ARN"
  value       = aws_ecr_repository.community.arn
}

output "backend_repository_name" {
  description = "Backend ECR repository name"
  value       = aws_ecr_repository.backend.name
}

output "frontend_repository_name" {
  description = "Frontend ECR repository name"
  value       = aws_ecr_repository.frontend.name
}

output "community_repository_name" {
  description = "Community ECR repository name"
  value       = aws_ecr_repository.community.name
}

output "backend_registry_id" {
  description = "Backend registry ID"
  value       = aws_ecr_repository.backend.registry_id
}

output "frontend_registry_id" {
  description = "Frontend registry ID"
  value       = aws_ecr_repository.frontend.registry_id
}

output "community_registry_id" {
  description = "Community registry ID"
  value       = aws_ecr_repository.community.registry_id
}

output "all_repository_urls" {
  description = "Map of all ECR repository URLs"
  value = {
    backend   = aws_ecr_repository.backend.repository_url
    frontend  = aws_ecr_repository.frontend.repository_url
    community = aws_ecr_repository.community.repository_url
  }
}

output "all_repository_arns" {
  description = "Map of all ECR repository ARNs"
  value = {
    backend   = aws_ecr_repository.backend.arn
    frontend  = aws_ecr_repository.frontend.arn
    community = aws_ecr_repository.community.arn
  }
}

output "all_repository_names" {
  description = "Map of all ECR repository names"
  value = {
    backend   = aws_ecr_repository.backend.name
    frontend  = aws_ecr_repository.frontend.name
    community = aws_ecr_repository.community.name
  }
}