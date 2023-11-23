import redis from 'redis';
const redisClient = redis.createClient()
.on('error', err => console.log('Redis Client Error', err))

export {redisClient}