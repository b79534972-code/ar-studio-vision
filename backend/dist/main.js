"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookieParser = require("cookie-parser");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        rawBody: true,
    });
    app.use(cookieParser());
    const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
        .split(',')
        .map(o => o.trim());
    app.enableCors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, Postman, server-to-server)
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.warn(`CORS blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
                callback(null, false);
            }
        },
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
        exposedHeaders: ['Set-Cookie'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map