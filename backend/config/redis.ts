import { createClient, RedisClientType } from "redis";
// const redisClient = createClient({ url: "redis://localhost:6379" })
// .on('error', err => console.log('Redis Client Error', err))

export class RedisClient {
  private static instance: RedisClient;
  private redisC: RedisClientType;
  private constructor() {
    this.redisC = createClient({ url: "redis://localhost:6379" });
    this.redisC.connect();
  }
  public static getInstance = (): RedisClient => {
    if (!this.instance) {
      this.instance = new RedisClient();
    }
    return this.instance;
  };
  public getRedisClient = (): RedisClientType => {
    return this.redisC;
  };
  public disconnect = async () => {
    await this.redisC.disconnect();
  };
}
