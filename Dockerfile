# Stage 1: build the Vite React application
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies based on the lockfile for reproducible builds
COPY package.json package-lock.json ./
RUN npm ci

# Copy the remaining source code and build the production bundle
COPY . .
RUN npm run build

# Stage 2: serve the built assets with a lightweight web server
FROM nginx:1.25-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]