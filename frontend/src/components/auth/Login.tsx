import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { ILoginFormData } from '@/interfaces/auth.interfaces';
import Button from '../Button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from "next/router";
import useUserStore from "@/hooks/useUserStore";
const LoginForm: React.FC = () => {
  const {login, getUser, loading}= useAuth()
  const {push} = useRouter();
  const [loginData, setLoginData] = useState<ILoginFormData>({
    email: '',
    password: '',
  });
  const [isGetUser, setIsGetUser] = useState(false);
const {user}= useUserStore()
  useEffect(()=>{
    if(!isGetUser && !loading) getUser().then(()=> setIsGetUser(true)) 
    return
  },[isGetUser,getUser, loading]);

  useEffect(()=>{
    if(isGetUser && user?.email){
      console.log("user",user)
      push("/chat-window")
    }
    return 
  },[user,isGetUser,push]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async(e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(loginData);
  
  };


  return (
  
      <form className="max-w-md mx-auto rounded-lg" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-8 mt-2 text-center ">Welcome Back!</h2>
        <input
          type="email"
          name="email"
          value={loginData.email}
          onChange={handleInputChange}
          placeholder="Email"
          className="w-full bg-white rounded-lg border-gray-300 mb-6 p-2"
        />
        <input
          type="password"
          name="password"
          value={loginData.password}
          onChange={handleInputChange}
          placeholder="Password"
          className="w-full bg-white rounded-lg border-gray-300 mb-6 p-2"
        />
        <Button type='submit' className='w-full' variant='primary'>Login</Button>
      </form>
  );
};

export default LoginForm;
