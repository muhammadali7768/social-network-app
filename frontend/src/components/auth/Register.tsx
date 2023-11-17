import React, { useState, ChangeEvent, FormEvent } from "react";
import Button from "../Button";
import {IRegisterFormData} from '@/interfaces/auth.interfaces'
import { useAuth } from '@/hooks/useAuth';
const RegisterForm: React.FC = () => {
  const {register}=useAuth();
  const [formData, setFormData] = useState<IRegisterFormData>({
    username: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async(e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await register(formData)
  };


  return (
    <form className="max-w-md mx-auto rounded-lg" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-8 mt-2 text-center">
        Join our Social Network
      </h2>
      <input
        type="text"
        name="username"
        value={formData.username}
        onChange={handleInputChange}
        placeholder="Username"
        className="w-full bg-white rounded-lg border-gray-300 mb-6 p-2"
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="Email"
        className="w-full bg-white rounded-lg border-gray-300 mb-6 p-2"
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        placeholder="Password"
        className="w-full bg-white rounded-lg border-gray-300 mb-6 p-2"
      />
      <Button type="submit" className="w-full" variant="primary">
        Register
      </Button>
    </form>
  );
};

export default RegisterForm;
