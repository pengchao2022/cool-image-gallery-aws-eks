# ===== Build Stage =====
FROM node:18-alpine AS build
WORKDIR /app

# 复制依赖文件并安装
COPY package*.json ./
RUN npm ci

# 复制所有源代码
COPY . .

# 指定入口文件目录（public/index.html）
ENV VITE_PUBLIC_DIR=public

# 构建前端产物
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
