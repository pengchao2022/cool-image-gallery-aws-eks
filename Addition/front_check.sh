# 获取前端 Service 的 ClusterIP
FRONTEND_CLUSTER_IP=$(kubectl get service frontend-service -n comic-website -o jsonpath='{.spec.clusterIP}')

# 测试前端返回的实际内容
kubectl run test-frontend -n comic-website --image=curlimages/curl --rm -it --restart=Never -- curl -s http://$FRONTEND_CLUSTER_IP
