interface IUser {
    username: string;
    email: string;
    password: string;
    token: string
  }

  interface ILoginFormData extends Pick<IUser, 'email' | 'password'> {}

  interface IRegisterFormData extends Pick<IUser, 'username' | 'email' | 'password'> {}

  interface IFortgotPasswordFormData  extends Pick<IUser, 'email'> {}
  
   interface IResetPasswordFormData  extends Pick<IUser, 'password' | 'token'> {}

  export type { IUser, ILoginFormData, IRegisterFormData, IFortgotPasswordFormData, IResetPasswordFormData };
  