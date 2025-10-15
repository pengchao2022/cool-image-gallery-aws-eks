# 获取当前 backend deployment 使用的镜像
BACKEND_IMAGE=$(kubectl get deployment backend-deployment -n comic-website -o jsonpath='{.spec.template.spec.containers[0].image}')

# 使用 npm run migrate 测试
kubectl run db-migration-test -n comic-website \
  --image=$BACKEND_IMAGE \
  --restart=Never \
  --rm -it -- \
  npm run migrate
