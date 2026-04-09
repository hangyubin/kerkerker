# 多阶段构建 - 生产环境 Dockerfile
# 修复 QEMU ARM64 兼容性问题

# ==================== 阶段 1: 依赖安装 ====================
FROM node:20-alpine AS deps

# 安装 libc6-compat 以提供更好的兼容性
RUN apk add --no-cache libc6-compat

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json* ./

# 安装依赖
# 使用 --unsafe-perm 避免权限问题，--maxsockets 限制并发连接
RUN npm ci --unsafe-perm --maxsockets 1 && \
    npm cache clean --force

# ==================== 阶段 2: 构建应用 ====================
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量（构建时需要）
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 构建应用
RUN npm run build

# ==================== 阶段 3: 运行应用 ====================
FROM node:20-alpine AS runner

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 设置权限
RUN chown -R nextjs:nodejs /app

# 切换用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置健康检查（禁用代理）
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD NO_PROXY=localhost node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "server.js"]
