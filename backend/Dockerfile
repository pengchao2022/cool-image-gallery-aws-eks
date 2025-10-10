FROM node:18-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache for dependencies
COPY package*.json ./
RUN npm install

# Copy all source code to the container
COPY . .

# 调试：显示文件结构
RUN ls -la && ls -la src/ && ls -la src/routes/

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "src/app.js"]