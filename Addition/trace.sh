# 检查最近的 Auto Scaling 活动
aws autoscaling describe-scaling-activities \
  --auto-scaling-group-name eks-comic-website-nodegroup-e4cce441-4a0b-03fb-8421-2b2e19c19091 \
  --max-items 20

# 检查 CloudTrail 事件
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=ResourceName,AttributeValue=eks-comic-website-nodegroup-e4cce441-4a0b-03fb-8421-2b2e19c19091 \
  --max-results 10
