"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisConnectionOptions = getRedisConnectionOptions;
function getRedisConnectionOptions() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
        const parsed = new URL(redisUrl);
        return {
            host: parsed.hostname,
            port: Number(parsed.port || '6379'),
            username: parsed.username || undefined,
            password: parsed.password || undefined,
        };
    }
    return {
        host: process.env.REDIS_HOST || 'redis',
        port: Number(process.env.REDIS_PORT) || 6379,
        username: process.env.REDIS_USERNAME || undefined,
        password: process.env.REDIS_PASSWORD || undefined,
    };
}
//# sourceMappingURL=redis.config.js.map