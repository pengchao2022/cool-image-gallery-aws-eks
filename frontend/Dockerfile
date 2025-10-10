# ===== Build Stage =====
FROM node:18-alpine AS build
WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci

# 复制源码（包括 public）
COPY . .

# 把 public/index.html 移动到根目录（Vite 默认入口）
RUN cp public/index.html ./index.html

# 构建前端
RUN npm run build

# ===== Production Stage =====
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# 清理默认文件
RUN rm -rf ./*

# 拷贝构建结果
COPY --from=build /app/dist .

# 拷贝 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
