import React, { useState, ChangeEvent, FormEvent } from 'react';
import Button from '../Button';
interface LoginData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: '',
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(loginData); // Handle login logic here
  };

  const handleRegister = () => {
    console.log('User clicked the Register button');
    // Logic to navigate to the registration page or handle registration
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
