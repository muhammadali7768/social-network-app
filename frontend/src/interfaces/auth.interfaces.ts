interface IUser {
    id: number;
    username: string;
    email: string;
    password: string;
    accessToken: string
    refreshToken:string
  }

  interface ILoginFormData extends Pick<IUser, 'email' | 'password'> {}

  interface IRegisterFormData extends Pick<IUser, 'username' | 'email' | 'password'> {}

  interface IFortgotPasswordFormData  extends Pick<IUser, 'email'> {}
  
   interface IResetPasswordFormData  extends Pick<IUser, 'password' | 'accessToken'> {}

   interface IListUser extends Pick<IUser, 'id'| 'username'| 'email'> {}

  export type { IUser, ILoginFormData, IRegisterFormData, IFortgotPasswordFormData, IResetPasswordFormData, IListUser };
  