#!/bin/bash

set -e

# 配置
NAMESPACE="comic-website"
CLUSTER_NAME="comic-website-prod"
REGION="us-east-1"

echo "🚀 Starting Kubernetes deployment..."

# 更新 kubeconfig
aws eks update-kubeconfig --region $REGION --name $CLUSTER_NAME

# 创建命名空间
kubectl apply -f k8s-manifests/namespaces/

# 替换镜像标签
sed -i.bak "s|latest|${GIT_COMMIT:0:8}|g" k8s-manifests/deployments/backend-deployment.yaml
sed -i.bak "s|latest|${GIT_COMMIT:0:8}|g" k8s-manifests/deployments/frontend-deployment.yaml

# 应用所有配置
kubectl apply -k k8s-manifests/

# 等待部署完成
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=600s deployment/backend-deployment -n $NAMESPACE
kubectl wait --for=condition=available --timeout=600s deployment/frontend-deployment -n $NAMESPACE

# 显示部署状态
echo "📊 Deployment status:"
kubectl get deployments -n $NAMESPACE
kubectl get pods -n $NAMESPACE
kubectl get services -n $NAMESPACE
kubectl get ingress -n $NAMESPACE

echo "✅ Deployment completed successfully!"