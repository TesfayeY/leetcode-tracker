import { createClient, RedisClientType } from 'redis';
import { defineNitroPlugin } from 'nitropack/runtime';

declare global {
  var __redisClient: RedisClientType | undefined;
  var __redisClientPromise: Promise<RedisClientType> | undefined; // Add a promise to track connection
}

// Function to connect to Redis, returning a promise that resolves when connected
async function connectToRedisInternal(): Promise<RedisClientType> {
    if (globalThis.__redisClient && globalThis.__redisClient.isReady) {
        console.log('Redis client already connected (via globalThis).');
        return globalThis.__redisClient;
    }

    if (globalThis.__redisClientPromise) {
        console.log('Redis connection already in progress. Waiting for existing promise.');
        return globalThis.__redisClientPromise; // Return existing connection promise
    }

    // If no client or promise exists, start a new connection
    globalThis.__redisClientPromise = (async () => {
        try {
            console.log('Attempting to connect to Redis...');
            const client = createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379'
            });

            client.on('error', (err) => {
                console.error('Redis Client Error (from plugin):', err);
                //On connection error, invalidate the promise so retries can happen
                globalThis.__redisClient = undefined;
                globalThis.__redisClientPromise = undefined;
            });

            await client.connect();
            console.log('Successfully connected to Redis.');
            globalThis.__redisClient = client; // Store connected client
            return client;
        } catch (error) {
            console.error('CRITICAL: Failed to connect to Redis on server startup:', error);
            globalThis.__redisClient = undefined;
            globalThis.__redisClientPromise = undefined; // Clear on error too
            throw error;
        }
    })();
    return globalThis.__redisClientPromise;
}

// Function to disconnect from Redis
async function disconnectFromRedis(): Promise<void> {
    if (globalThis.__redisClient && globalThis.__redisClient.isReady) {
        await globalThis.__redisClient.disconnect();
        console.log('Disconnected from Redis.');
        globalThis.__redisClient = undefined;
        globalThis.__redisClientPromise = undefined;
    }
}

// Nuxt 3 Nitro Plugin definition
export default defineNitroPlugin(async (nitroApp) => {
    try {
        const client = await connectToRedisInternal();
        if (!nitroApp.context) {
            nitroApp.context = {};
        }

        // Attach the client to the Nitro context.
        nitroApp.context.redis = client;

        // Register hook for graceful shutdown
        nitroApp.hooks.hook('close', async () => {
            await disconnectFromRedis();
        });

    } catch (error) {
        console.error('CRITICAL: Nitro plugin failed during Redis initialization.', error);
    }
});