# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy only what’s needed for dependency resolution first
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build


# ---------- Runtime stage ----------
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove the default Nginx static assets
RUN rm -rf ./*

# Copy build artifacts from previous stage
COPY --from=builder /app/dist ./

# Expose port 80
EXPOSE 80

# Nginx serves the static site
CMD ["nginx", "-g", "daemon off;"]
