output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.main.id
}

output "ec2_public_ip" {
  description = "EC2 instance public IP address"
  value       = aws_instance.main.public_ip
}

output "ec2_private_ip" {
  description = "EC2 instance private IP address"
  value       = aws_instance.main.private_ip
}

output "ec2_public_dns" {
  description = "EC2 instance public DNS name"
  value       = aws_instance.main.public_dns
}

output "ec2_security_group_id" {
  description = "EC2 security group ID"
  value       = aws_security_group.ec2.id
}

output "key_pair_name" {
  description = "SSH key pair name"
  value       = aws_key_pair.ec2.key_name
}