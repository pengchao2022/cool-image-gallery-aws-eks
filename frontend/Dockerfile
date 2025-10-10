# ===== Build Stage =====
FROM node:18-alpine AS build

WORKDIR /app

# 拷贝依赖文件并安装所有依赖（包括 devDependencies）
COPY package*.json ./
RUN npm install

# 拷贝前端源代码
COPY . .

# 构建前端产物
RUN npm run build

# ===== Production Stage =====
FROM nginx:alpine

# 拷贝构建后的文件到 nginx 静态目录
COPY --from=build /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
