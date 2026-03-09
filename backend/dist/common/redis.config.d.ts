export interface RedisConnectionOptions {
    host: string;
    port: number;
    username?: string;
    password?: string;
}
export declare function getRedisConnectionOptions(): RedisConnectionOptions;
