FROM node:20

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend .

RUN npx prisma generate
RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start"]