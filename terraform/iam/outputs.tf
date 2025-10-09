# EKS Roles
output "eks_cluster_role_arn" {
  description = "EKS cluster role ARN"
  value       = aws_iam_role.eks_cluster_role.arn
}

output "eks_node_group_role_arn" {
  description = "EKS node group role ARN"
  value       = aws_iam_role.eks_node_group_role.arn
}

# Application Roles
output "app_backend_role_arn" {
  description = "Backend application role ARN"
  value       = aws_iam_role.app_backend_role.arn
}

output "app_frontend_role_arn" {
  description = "Frontend application role ARN"
  value       = aws_iam_role.app_frontend_role.arn
}

# ALB Controller Role
output "alb_controller_role_arn" {
  description = "ALB controller role ARN"
  value       = aws_iam_role.alb_controller_role.arn
}

# CI/CD User
output "cicd_user_access_key" {
  description = "CI/CD user access key ID"
  value       = aws_iam_access_key.cicd_user.id
  sensitive   = true
}

output "cicd_user_secret_key" {
  description = "CI/CD user secret access key"
  value       = aws_iam_access_key.cicd_user.secret
  sensitive   = true
}

output "cicd_user_arn" {
  description = "CI/CD user ARN"
  value       = aws_iam_user.cicd_user.arn
}

# Application Policy ARNs
output "app_backend_policy_arn" {
  description = "Backend application policy ARN"
  value       = aws_iam_policy.app_backend_policy.arn
}

output "app_frontend_policy_arn" {
  description = "Frontend application policy ARN"
  value       = aws_iam_policy.app_frontend_policy.arn
}