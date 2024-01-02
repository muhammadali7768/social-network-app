import { IMessage } from "./message.interface";

interface IUser {
    id: number;
    username: string;
    email: string;
    password: string;
    accessToken: string
    refreshToken:string
    status:string,
    messages: IMessage[]
    isNewMessage:boolean
  }

  interface ILoginFormData extends Pick<IUser, 'email' | 'password'> {}

  interface IRegisterFormData extends Pick<IUser, 'username' | 'email' | 'password'> {}

  interface IFortgotPasswordFormData  extends Pick<IUser, 'email'> {}
  
   interface IResetPasswordFormData  extends Pick<IUser, 'password' | 'accessToken'> {}

   interface IListUser extends Pick<IUser, 'id'| 'username'| 'email' |  'status'| "messages"| "isNewMessage"> {}

  export type { IUser, ILoginFormData, IRegisterFormData, IFortgotPasswordFormData, IResetPasswordFormData, IListUser };
  