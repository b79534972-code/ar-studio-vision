FROM node:20

WORKDIR /app

# Copy only backend package files first for better cache
COPY package*.json ./
# Use cache for node_modules
RUN --mount=type=cache,target=/app/node_modules npm install

# Copy the rest of the backend source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start"]

