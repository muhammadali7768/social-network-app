import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...rest }) => {
  const variantClasses = {
    primary: 'text-white font-semibold py-2 bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600',
    secondary: 'bg-gray-300 text-black',
  };

  return (
    <button
      {...rest}
      className={`py-2 px-4 rounded-lg transition duration-300 ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
