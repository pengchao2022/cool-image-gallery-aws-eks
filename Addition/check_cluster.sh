#!/bin/bash

# 替换为您的集群名
CLUSTER_NAME="comic-website-prod"

echo "🔍 Diagnosing Node Count Discrepancy"
echo "===================================="

# 1. Kubernetes 看到的节点数
K8S_NODES=$(kubectl get nodes --no-headers | wc -l)
echo "1. Kubernetes Nodes: $K8S_NODES"

# 2. EC2 实例数
EC2_INSTANCES=$(aws ec2 describe-instances \
  --filters "Name=tag:eks:cluster-name,Values=$CLUSTER_NAME" \
  --query 'length(Reservations[].Instances[])' \
  --output text)
echo "2. EC2 Instances: $EC2_INSTANCES"

# 3. 检查节点组期望数量
NODEGROUP=$(aws eks list-nodegroups --cluster-name $CLUSTER_NAME --query 'nodegroups[0]' --output text)
if [ "$NODEGROUP" != "None" ]; then
    DESIRED_SIZE=$(aws eks describe-nodegroup \
      --cluster-name $CLUSTER_NAME \
      --nodegroup-name $NODEGROUP \
      --query 'nodegroup.scalingConfig.desiredSize' \
      --output text)
    echo "3. Node Group Desired Size: $DESIRED_SIZE"
fi

# 4. 检查 Auto Scaling 组
echo "4. Auto Scaling Group Status:"
aws autoscaling describe-auto-scaling-groups \
  --query "AutoScalingGroups[?Tags[?Key=='eks:cluster-name' && Value=='$CLUSTER_NAME']].{
    Name:AutoScalingGroupName, 
    Desired:DesiredCapacity, 
    Current:Instances.length
  }" \
  --output table

# 5. 检查是否有失败的实例
echo "5. Instance States:"
aws ec2 describe-instances \
  --filters "Name=tag:eks:cluster-name,Values=$CLUSTER_NAME" \
  --query 'Reservations[].Instances[].[InstanceId, State.Name]' \
  --output table

echo -e "\n📊 Summary:"
echo "- Kubernetes sees: $K8S_NODES nodes"
echo "- EC2 has: $EC2_INSTANCES instances" 
echo "- Node group wants: $DESIRED_SIZE nodes"
