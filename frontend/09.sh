# 获取 ALB 地址
ALB_URL=$(kubectl get ingress comic-website-ingress -n comic-website -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "ALB 地址: http://$ALB_URL"

# 直接测试登录 API
curl -X POST http://$ALB_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' \
  -v
