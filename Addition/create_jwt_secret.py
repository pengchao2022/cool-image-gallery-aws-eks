import secrets
import base64

# 生成 32 字节的随机密钥
jwt_secret = base64.b64encode(secrets.token_bytes(32)).decode('utf-8')
print(jwt_secret)