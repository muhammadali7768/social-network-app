interface IUser {
    id: Number;
    username: string;
    email: string;
    password: string;
    token: string
  }

  interface ILoginFormData extends Pick<IUser, 'email' | 'password'> {}

  interface IRegisterFormData extends Pick<IUser, 'username' | 'email' | 'password'> {}

  interface IFortgotPasswordFormData  extends Pick<IUser, 'email'> {}
  
   interface IResetPasswordFormData  extends Pick<IUser, 'password' | 'token'> {}

   interface IListUser extends Pick<IUser, 'id'| 'username'| 'email'> {}

  export type { IUser, ILoginFormData, IRegisterFormData, IFortgotPasswordFormData, IResetPasswordFormData, IListUser };
  