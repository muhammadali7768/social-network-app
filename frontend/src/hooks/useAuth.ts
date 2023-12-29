import { useState } from "react";
import cookie from "js-cookie";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import StorageService from "@/services/storage";
import { request } from "@/config/axios";
import { IFortgotPasswordFormData, ILoginFormData, IRegisterFormData, IResetPasswordFormData } from "@/interfaces/auth.interfaces";
import useUserStore from "@/hooks/useUserStore";


export const useAuth = () => {
  const setUser= useUserStore(state=>state.setUser)
  const clearUserStore=useUserStore(state=>state.clearUserStore)
  //const { setUser, clearUserStore } = useUserStore();
  const { push } = useRouter();
  const [loading, setLoading] = useState(false);


  const login = async (postData: ILoginFormData) => {
    try {
      setLoading(true);
      const { data } = await request.post("auth/login", postData);
      setLoading(false);
      if (data.email) {
        StorageService.setAuthData(data.accessToken, data.refreshToken);
        StorageService.setUserData(data)
        setUser(data)
        cookie.set("token", data.accessToken, { expires: 1 / 24 });
        push('/chat-window')
      }
    } catch (err: any) {
      setLoading(false);
      console.log(err);
      toast.error(err.response?.data.message, {
        position: toast.POSITION.TOP_RIGHT,
      });
      if (err.response?.data?.error === "EmailNotVerified") push("/auth/verify-email")
    }
  };
  

  const register = async (postData: IRegisterFormData) => {
    try {
      setLoading(true);
      const { data } = await request.post("auth/register", postData);
      setLoading(false);
      if (data.id) {
        
        StorageService.setUserData(data);
        setUser(data);
       // push("/auth/verify-email");
      }
    } catch (err: any) {
      setLoading(false);
      console.log(err);
      toast.error(err.response?.data.message, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const getUser = async () => {
    try {
      setLoading(true);
      const { data } = await request.get("auth/current-user");
      setLoading(false);    
      if (data.id) {   
        StorageService.setUserData(data)
        setUser(data)
      }
    } catch (err: any) {
      setLoading(false);
      console.log(err);
      StorageService.clearUserData()
      clearUserStore()
      toast.error(err.response?.data.message, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const sendEmailVerification = async (email: string) => {
    
    try {
      setLoading(true);
      const { data } = await request.post("send_email_verification", {
        email: email,
      });
      setLoading(false);
      if (data.id) {
        // push('/welcome')
      }
    } catch (err: any) {
      setLoading(false);
      console.log(err);
      toast.error(err.response?.data.message, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const sendEmailForForgotPassword = async ({ email }: IFortgotPasswordFormData) => {
    try {
      setLoading(true);
      const { status } = await request.post(`forgot_password`, { email });
      setLoading(false);
      if (status === 200) {
        toast.success("We've sent you the reset instructions, please check it.", { position: toast.POSITION.TOP_RIGHT, });
      }
    } catch (err: any) {
      setLoading(false);
      console.log(err);
      toast.error(err.response?.data.message, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  }

  const resetPassword = async ({ password, token }: IResetPasswordFormData) => {
    try {
      setLoading(true);
      const { status } = await request.post(`reset_password`, { password, token });
      setLoading(false);
      if (status === 200) {
        push("/auth/login");
      }
    } catch (err: any) {
      setLoading(false);
      console.log(err);
      toast.error(err.response?.data.message, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  }

  const logout = async () => {
    try {
      setLoading(true);
      const res = await request.get("auth/logout");
      setLoading(false);
      clearUserStore();
      if (res.status===200) {
        StorageService.clearUserData();
        clearUserStore();
        push('/')
      }
    } catch (err: any) {
      setLoading(false);
      toast.error(err.response?.data.message, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  return { login, register, sendEmailVerification, sendEmailForForgotPassword, resetPassword, getUser, logout, loading };
};


