FROM node:20

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --include=dev

COPY backend .

RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

EXPOSE 5000

CMD ["npm", "run", "start"]
