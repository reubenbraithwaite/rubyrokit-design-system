# Stage 1: Build the application
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Run the application
FROM node:18-alpine

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Copy package files
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from the previous stage
COPY --from=build /app/dist ./dist

# Create a logs directory
RUN mkdir -p logs

# Expose the port
EXPOSE 4000

# Start the application
CMD ["node", "dist/index.js"]
