# 使用 JSON patch 完全替换健康检查
kubectl patch deployment community-deployment -n comic-website --type='json' -p='[
  {
    "op": "replace",
    "path": "/spec/template/spec/containers/0/livenessProbe",
    "value": {
      "tcpSocket": {"port": 3002},
      "initialDelaySeconds": 60,
      "periodSeconds": 30,
      "timeoutSeconds": 5,
      "failureThreshold": 3
    }
  },
  {
    "op": "replace",
    "path": "/spec/template/spec/containers/0/readinessProbe", 
    "value": {
      "tcpSocket": {"port": 3002},
      "initialDelaySeconds": 30,
      "periodSeconds": 15,
      "timeoutSeconds": 5,
      "failureThreshold": 3
    }
  }
]'
