terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "terraformstatefile090909"
    key            = "image-for-eks.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "comic-website-tfstate-lock"
  }
}

provider "aws" {
  region = var.aws_region
}