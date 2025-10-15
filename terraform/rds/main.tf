# Database Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-db-subnet-group"
    }
  )
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-${var.environment}-rds-sg"
  description = "Security group for RDS PostgreSQL database"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "Allow PostgreSQL access from VPC"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-rds-sg"
    }
  )
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}-db"

  # Database Configuration
  engine                = "postgres"
  engine_version        = "14.17"
  instance_class        = var.instance_class
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = "gp2"

  # Database Credentials
  db_name  = var.database_name
  username = var.username
  password = var.password
  port     = 5432

  # Network Configuration
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  multi_az               = var.multi_az

  # Maintenance & Backup
  backup_retention_period   = var.backup_retention_period
  backup_window             = "03:00-04:00"
  maintenance_window        = "sun:04:00-sun:05:00"
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.final_snapshot_identifier

  # Performance & Monitoring
  performance_insights_enabled          = var.performance_insights_enabled
  performance_insights_retention_period = var.performance_insights_enabled ? 7 : null
  monitoring_interval                   = var.monitoring_interval

  # Database Settings
  parameter_group_name = aws_db_parameter_group.main.name
  deletion_protection  = var.deletion_protection
  apply_immediately    = var.apply_immediately

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-db"
    }
  )
}

# Database Parameter Group
resource "aws_db_parameter_group" "main" {
  name   = "${var.project_name}-${var.environment}-postgres14"
  family = "postgres14"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-postgres14-params"
    }
  )
}

# RDS Enhanced Monitoring IAM Role
resource "aws_iam_role" "rds_monitoring" {
  name = "${var.project_name}-${var.environment}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-rds-monitoring-role"
    }
  )
}

# Attach RDS Enhanced Monitoring policy using the non-deprecated method
resource "aws_iam_role_policy_attachment" "rds_enhanced_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# ==============================================================================
# Additional Databases Configuration
# ==============================================================================

# Community Database
resource "postgresql_database" "communitydb" {
  name              = var.community_db_name
  owner             = aws_db_instance.main.username
  template          = "template0"
  encoding          = "UTF8"
  lc_collate        = "en_US.UTF-8"
  lc_ctype          = "en_US.UTF-8"
  allow_connections = true

  depends_on = [aws_db_instance.main]
}

# Community Database User
resource "postgresql_role" "community_user" {
  name     = var.community_db_username
  login    = true
  password = var.community_db_password
  inherit  = true
  roles    = [aws_db_instance.main.username]

  depends_on = [aws_db_instance.main]
}

# Grant permissions to community user
resource "postgresql_grant" "communitydb_privileges" {
  database    = postgresql_database.communitydb.name
  role        = postgresql_role.community_user.name
  object_type = "database"
  privileges  = ["CREATE", "CONNECT", "TEMPORARY"]

  depends_on = [postgresql_database.communitydb, postgresql_role.community_user]
}