import { useState } from "react";
import cookie from "js-cookie";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { request } from "@/config/axios";
import { FormError } from "@/components/errors/FormError";
import {
  IFortgotPasswordFormData,
  ILoginFormData,
  IRegisterFormData,
  IResetPasswordFormData,
} from "@/interfaces/auth.interfaces";
import useUserStore from "@/hooks/useUserStore";

export const useAuth = () => {
  const setUser = useUserStore((state) => state.setUser);
  const clearUserStore = useUserStore((state) => state.clearUserStore);
  const [errors, setErrors]=useState(null)
  const { push } = useRouter();
  const [loading, setLoading] = useState(false);

  const login = async (postData: ILoginFormData) => {
    try {
      setLoading(true);
      const { data } = await request.post("auth/login", postData);
      console.log("Errors",data)
      setLoading(false);
      if (data && data.errors && data.errors.length > 0) {
        setErrors(data.errors);
      }
      else {
        console.log("ERRRRRRR")
      }
      if (data.email) {
        setUser(data);
        push("/chat-window");
      }
    } catch (err: any) {
      console.log(err.response)
      setLoading(false);

      toast.error(err.response?.data.message, {
        position: toast.POSITION.TOP_RIGHT,
      });
      if (err.response?.data?.error === "EmailNotVerified")
        push("/auth/verify-email");
    }
  };

  const register = async (postData: IRegisterFormData) => {
    try {
      setLoading(true);
      const { data } = await request.post("auth/register", postData);
      setLoading(false);
      if (data.id) {
        setUser(data);
      }
    } catch (err: any) {
      setLoading(false);

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
        setUser(data);
      }
    } catch (err: any) {
      setLoading(false);

      clearUserStore();
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
        //TODO: redirect to email confirmation page
      }
    } catch (err: any) {
      setLoading(false);

      toast.error(err.response?.data.message, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const sendEmailForForgotPassword = async ({
    email,
  }: IFortgotPasswordFormData) => {
    try {
      setLoading(true);
      const { status } = await request.post(`forgot_password`, { email });
      setLoading(false);
      if (status === 200) {
        toast.success(
          "We've sent you the reset instructions, please check it.",
          { position: toast.POSITION.TOP_RIGHT }
        );
      }
    } catch (err: any) {
      setLoading(false);

      toast.error(err.response?.data.message, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const resetPassword = async ({ password }: IResetPasswordFormData) => {
    try {
      setLoading(true);
      const { status } = await request.post(`reset_password`, { password });
      setLoading(false);
      if (status === 200) {
        push("/auth/login");
      }
    } catch (err: any) {
      setLoading(false);

      toast.error(err.response?.data.message, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const res = await request.get("auth/logout");
      setLoading(false);
      if (res.status === 200) {
        clearUserStore();
        cookie.remove("token", { path: "/" });
        push("/");
      }
    } catch (err: any) {
      setLoading(false);
      toast.error(err.response?.data.message, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  return {
    login,
    register,
    sendEmailVerification,
    sendEmailForForgotPassword,
    resetPassword,
    getUser,
    logout,
    loading,
  };
};
