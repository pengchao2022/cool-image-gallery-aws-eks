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

# Bucket Public Access Block - 保持安全设置
resource "aws_s3_bucket_public_access_block" "comic_storage" {
  bucket = aws_s3_bucket.comic_storage.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
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

    # 添加必需的 filter
    filter {
      prefix = ""
    }
  }

  rule {
    id     = "noncurrent_version_expiration"
    status = var.versioning_enabled ? "Enabled" : "Disabled"

    noncurrent_version_expiration {
      noncurrent_days = var.noncurrent_version_expiration_days
    }

    # 添加必需的 filter
    filter {
      prefix = ""
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

      # 添加必需的 filter
      filter {
        prefix = ""
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

# Bucket Policy for EKS access and limited public read
resource "aws_s3_bucket_policy" "comic_storage" {
  bucket = aws_s3_bucket.comic_storage.id
  policy = data.aws_iam_policy_document.comic_storage.json
}

data "aws_iam_policy_document" "comic_storage" {
  # 1. 允许 EKS Node Group 完全访问
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
    ]

    resources = [
      aws_s3_bucket.comic_storage.arn,
      "${aws_s3_bucket.comic_storage.arn}/*",
    ]
  }

  # 2. 允许公众只读取特定路径下的对象（允许 HTTP 和 HTTPS）
  statement {
    sid    = "AllowPublicReadSpecificPaths"
    effect = "Allow"

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "${aws_s3_bucket.comic_storage.arn}/comics/*",
      "${aws_s3_bucket.comic_storage.arn}/avatars/*",  # 添加这一行
    ]
  }
}