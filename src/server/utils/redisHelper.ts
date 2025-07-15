import { RedisClientType } from 'redis';
import { H3Event } from 'h3'; 

/**
 * Retrieves the Redis client instance.
 * This function waits for the global Redis client promise to resolve,
 * ensuring the client is connected before it's used by API routes/services.
 *
 * @returns A Promise that resolves to the RedisClientType instance.
 * @throws Error if the global Redis client promise is not set up (plugin failure)
 * or if the connection fails.
 */
export async function getRedisClient(): Promise<RedisClientType> {
    // Check if the global promise exists. If not, it means the plugin didn't run
    // or failed critically early.
    if (!globalThis.__redisClientPromise) {
        console.error('CRITICAL: globalThis.__redisClientPromise is undefined. Redis plugin might not have run or initialized correctly.');
        throw new Error('Redis connection promise not initialized. Check server/plugins/redis.ts.');
    }

    try {
        const client = await globalThis.__redisClientPromise;
        if (!client || !client.isReady) {
            console.error('CRITICAL: Redis client obtained from promise is not ready.');
            throw new Error('Redis client not ready after connection promise resolved.');
        }
        return client;
    } catch (error) {
        console.error('Failed to retrieve ready Redis client from global context:', error);
        throw error;
    }
}