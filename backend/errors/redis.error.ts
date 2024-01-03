import { CustomError } from "./custom.error";

export class RedisError extends CustomError {
  statusCode = 500;
  constructor(public message: string) {
    super(message);
    Object.setPrototypeOf(this, RedisError.prototype);
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}
