# 测试 community-db-setup 脚本
kubectl run debug-db-setup -n comic-website \
  --image=319998871902.dkr.ecr.us-east-1.amazonaws.com/comic-website-prod-backend:4b8fc911 \
  --rm -it --restart=Never --env="RDS_HOST=$(kubectl get secret rds-secret -n comic-website -o jsonpath='{.data.host}' | base64 -d)" \
  --env="RDS_PORT=5432" \
  --env="RDS_USERNAME=comicadmin" \
  --env="RDS_PASSWORD=$(kubectl get secret rds-secret -n comic-website -o jsonpath='{.data.password}' | base64 -d)" \
  --env="RDS_DATABASE=comicdb" \
  --env="COMMUNITY_DB_PASSWORD=$(kubectl get secret backend-secret -n comic-website -o jsonpath='{.data.community-db-password}' | base64 -d)" \
  -- /bin/sh -c "
set -e
echo '🚀 Starting Community database setup...'

# 从环境变量获取数据库连接信息
DB_HOST=\"\$RDS_HOST\"
DB_PORT=\"\$RDS_PORT\"
DB_USER=\"\$RDS_USERNAME\"
DB_PASSWORD=\"\$RDS_PASSWORD\"
MAIN_DB=\"\$RDS_DATABASE\"
COMMUNITY_DB=\"communitydb\"
COMMUNITY_USER=\"community_user\"
COMMUNITY_PASSWORD=\"\$COMMUNITY_DB_PASSWORD\"

echo '📊 Database configuration:'
echo '   Host: '\$DB_HOST''
echo '   Port: '\$DB_PORT''
echo '   Main Database: '\$MAIN_DB''
echo '   Community Database: '\$COMMUNITY_DB''
echo '   Community User: '\$COMMUNITY_USER''

# 安装 PostgreSQL 客户端
echo '📦 Installing PostgreSQL client...'
apk add --no-cache postgresql-client

# 等待数据库可用
echo '⏳ Waiting for database to be available...'
until pg_isready -h \$DB_HOST -p \$DB_PORT -U \$DB_USER -d \$MAIN_DB; do
  echo 'Waiting for database connection...'
  sleep 2
done

# 创建 Community 数据库
echo '🗃 Creating Community database...'
PGPASSWORD=\$DB_PASSWORD psql -h \$DB_HOST -p \$DB_PORT -U \$DB_USER -d \$MAIN_DB << EOF
CREATE DATABASE \$COMMUNITY_DB;
EOF

# 创建 Community 数据库用户
echo '👤 Creating Community database user...'
PGPASSWORD=\$DB_PASSWORD psql -h \$DB_HOST -p \$DB_PORT -U \$DB_USER -d \$MAIN_DB << EOF
CREATE USER \$COMMUNITY_USER WITH PASSWORD '\$COMMUNITY_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE \$COMMUNITY_DB TO \$COMMUNITY_USER;
EOF

echo '✅ Community database setup completed successfully!'
"
