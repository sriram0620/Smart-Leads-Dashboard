# Multi-stage build for production
FROM node:20-alpine AS base

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Development stage
FROM base AS development
ENV NODE_ENV=development
EXPOSE 5000 5173
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
ENV NODE_ENV=production

# Build frontend
RUN npm run build

EXPOSE 5000
CMD ["npm", "run", "server"]
