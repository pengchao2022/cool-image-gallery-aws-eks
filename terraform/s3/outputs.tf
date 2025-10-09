output "bucket_id" {
  description = "S3 bucket ID"
  value       = aws_s3_bucket.comic_storage.id
}

output "bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.comic_storage.arn
}

output "bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.comic_storage.bucket
}

output "bucket_domain_name" {
  description = "S3 bucket domain name"
  value       = aws_s3_bucket.comic_storage.bucket_domain_name
}

output "bucket_regional_domain_name" {
  description = "S3 bucket regional domain name"
  value       = aws_s3_bucket.comic_storage.bucket_regional_domain_name
}

output "bucket_hosted_zone_id" {
  description = "S3 bucket hosted zone ID"
  value       = aws_s3_bucket.comic_storage.hosted_zone_id
}