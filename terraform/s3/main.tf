# S3 Bucket for Comic Images
resource "aws_s3_bucket" "comic_storage" {
  bucket = "${var.project_name}-${var.environment}-comic-storage-${random_id.bucket_suffix.hex}"

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-comic-storage"
    }
  )
}

# Random suffix for bucket name to ensure global uniqueness
resource "random_id" "bucket_suffix" {
  byte_length = 8
}

# Bucket Ownership Controls
resource "aws_s3_bucket_ownership_controls" "comic_storage" {
  bucket = aws_s3_bucket.comic_storage.id

  rule {
    object_ownership = var.object_ownership
  }
}

# Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "comic_storage" {
  bucket = aws_s3_bucket.comic_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Bucket Versioning
resource "aws_s3_bucket_versioning" "comic_storage" {
  bucket = aws_s3_bucket.comic_storage.id

  versioning_configuration {
    status = var.versioning_enabled ? "Enabled" : "Suspended"
  }
}

# Server-Side Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "comic_storage" {
  bucket = aws_s3_bucket.comic_storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = var.sse_algorithm
    }
  }
}

# Lifecycle Configuration
resource "aws_s3_bucket_lifecycle_configuration" "comic_storage" {
  bucket = aws_s3_bucket.comic_storage.id

  rule {
    id     = "abort_incomplete_multipart_upload"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }

  rule {
    id     = "noncurrent_version_expiration"
    status = var.versioning_enabled ? "Enabled" : "Disabled"

    noncurrent_version_expiration {
      noncurrent_days = var.noncurrent_version_expiration_days
    }
  }

  dynamic "rule" {
    for_each = var.enable_intelligent_tiering ? [1] : []
    content {
      id     = "intelligent_tiering"
      status = "Enabled"

      transition {
        storage_class = "INTELLIGENT_TIERING"
        days          = 0
      }
    }
  }
}

# CORS Configuration for web access
resource "aws_s3_bucket_cors_configuration" "comic_storage" {
  bucket = aws_s3_bucket.comic_storage.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE"]
    allowed_origins = var.allowed_cors_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Bucket Policy for EKS access
resource "aws_s3_bucket_policy" "comic_storage" {
  bucket = aws_s3_bucket.comic_storage.id

  policy = data.aws_iam_policy_document.comic_storage.json
}

data "aws_iam_policy_document" "comic_storage" {
  statement {
    sid    = "AllowEKSNodeGroup"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = var.allowed_iam_principals
    }

    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
      "s3:GetObjectVersion",
      "s3:PutObjectVersion",
    ]

    resources = [
      aws_s3_bucket.comic_storage.arn,
      "${aws_s3_bucket.comic_storage.arn}/*",
    ]
  }

  statement {
    sid    = "DenyNonSSLRequests"
    effect = "Deny"

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions = [
      "s3:*",
    ]

    resources = [
      aws_s3_bucket.comic_storage.arn,
      "${aws_s3_bucket.comic_storage.arn}/*",
    ]

    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}