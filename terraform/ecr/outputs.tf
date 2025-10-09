output "backend_repository_url" {
  description = "Backend ECR repository URL"
  value       = aws_ecr_repository.backend_repo.repository_url
}

output "frontend_repository_url" {
  description = "Frontend ECR repository URL"
  value       = aws_ecr_repository.frontend_repo.repository_url
}

output "backend_repository_arn" {
  description = "Backend ECR repository ARN"
  value       = aws_ecr_repository.backend_repo.arn
}

output "frontend_repository_arn" {
  description = "Frontend ECR repository ARN"
  value       = aws_ecr_repository.frontend_repo.arn
}

output "backend_repository_name" {
  description = "Backend ECR repository name"
  value       = aws_ecr_repository.backend_repo.name
}

output "frontend_repository_name" {
  description = "Frontend ECR repository name"
  value       = aws_ecr_repository.frontend_repo.name
}

output "backend_registry_id" {
  description = "Backend registry ID"
  value       = aws_ecr_repository.backend_repo.registry_id
}

output "frontend_registry_id" {
  description = "Frontend registry ID"
  value       = aws_ecr_repository.frontend_repo.registry_id
}

output "all_repository_urls" {
  description = "Map of all ECR repository URLs"
  value = {
    backend  = aws_ecr_repository.backend_repo.repository_url
    frontend = aws_ecr_repository.frontend_repo.repository_url
  }
}

output "all_repository_arns" {
  description = "Map of all ECR repository ARNs"
  value = {
    backend  = aws_ecr_repository.backend_repo.arn
    frontend = aws_ecr_repository.frontend_repo.arn
  }
}