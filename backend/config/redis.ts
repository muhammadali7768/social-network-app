import { createClient, RedisClientType } from "redis";
import { IUser } from "../interfaces/user.interface";
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

  public async getOnlineUsers(
    pattern: string
  ) {
   let users:any[]=[]
    try {
      //   for await (const key of this.redisC.scanIterator({
      //     MATCH: pattern,
      //     COUNT: 50,
      // }))
      for await (const data of this.redisC.hScanIterator(pattern))
       {
       console.log("KEY",data.value)
       users.push(JSON.parse(data.value))
       // const user=await this.redisC.sMembers(key)
      //  if(value){
      //  console.log(user) 
      //    users=[...users, ...user]
      //  }
       }
      return users;
    } catch (error) {
      throw error;
    }
  }
  public saveUser=async(user:IUser, status:string)=>{
    await this.redisC.hSet(
      `online_users`,
      user.id,
      JSON.stringify(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        status: status
      })
    );
  }

  public findOnlineUser=async(userId:number)=>{
   const user= await this.redisC.hGet(`online_users`, userId.toString())
   if(user) return JSON.parse(user)
   else null
  }
}
