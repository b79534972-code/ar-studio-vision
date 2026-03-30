/**
 * NestJS Application Entry Point
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { mkdirSync } from 'fs';
import * as express from 'express';

function parseAllowedOrigins(): string[] {
  const defaults = ['http://localhost:5173', 'http://127.0.0.1:5173'];
  const configured = [process.env.FRONTEND_URL, process.env.FRONTEND_URLS]
    .filter(Boolean)
    .flatMap((value) => (value as string).split(','))
    .map((value) => value.trim())
    .filter(Boolean);

  return Array.from(new Set([...defaults, ...configured]));
}

async function bootstrap() {
  const generatedDir = join(process.cwd(), 'generated');
  mkdirSync(generatedDir, { recursive: true });

  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Required for Stripe webhook signature verification
  });

  app.use(cookieParser());
  app.use('/generated', express.static(generatedDir));
  const allowedOrigins = parseAllowedOrigins();
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  });

  console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap();
