import { RedisClient } from "../../config/redis";
import { IUser } from "../../interfaces/user.interface";
import { RedisClientType } from "redis";

export class RedisUserService {
  public redisClient: RedisClientType;

  constructor() {
    this.redisClient = RedisClient.getInstance().getRedisClient();
  }

  public async getOnlineUsers(pattern: string) {
    let users: any[] = [];
    try {
      for await (const data of this.redisClient.hScanIterator(pattern)) {
        console.log("KEY", data.value);
        users.push(JSON.parse(data.value));
      }
      return users;
    } catch (error) {
      throw error;
    }
  }
  public saveUser = async (user: IUser, status: string) => {
    await this.redisClient.hSet(
      `online_users`,
      user.id,
      JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        status: status,
      })
    );
  };

  public findOnlineUser = async (userId: number) => {
    const user = await this.redisClient.hGet(`online_users`, userId.toString());
    if (user) return JSON.parse(user);
    else null;
  };
}
