import React, { useState } from 'react';
import LoginForm from './Login';
import RegisterForm from './Register';
import Button from '../Button';
const AuthenticationForms: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <div className="flex flex-col items-center bg-slate-100 p-10 rounded-lg">
      <div className="flex space-x-4 mb-4">
        <Button variant={`${activeTab==='login'? 'primary': 'secondary'}`}
         onClick={() => setActiveTab('login')}
        >Login</Button>
         <Button variant={`${activeTab==='register'? 'primary': 'secondary'}`}
         onClick={() => setActiveTab('register')}
        >Register</Button>
      </div>
      <div className="w-full">
        <div
          className={`transition-opacity duration-300 ${activeTab === 'login' ? 'opacity-100' : 'opacity-0'}`}
        >
          {activeTab === 'login' && <LoginForm />}
        </div>
        <div
          className={`transition-opacity duration-300 ${activeTab === 'register' ? 'opacity-100' : 'opacity-0'}`}
        >
          {activeTab === 'register' && <RegisterForm />}
        </div>
      </div>
    </div>
  );
};

export default AuthenticationForms;
