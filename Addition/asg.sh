# 获取 Auto Scaling 组详细信息
ASG_NAME="eks-comic-website-nodegroup-e4cce441-4a0b-03fb-8421-2b2e19c19091"

aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names $ASG_NAME \
  --query 'AutoScalingGroups[0].{
    Name:AutoScalingGroupName,
    Desired:DesiredCapacity,
    Min:MinSize, 
    Max:MaxSize,
    Instances:Instances,
    Status:Status
  }'
