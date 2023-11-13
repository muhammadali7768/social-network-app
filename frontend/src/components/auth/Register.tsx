import React, { useState, ChangeEvent, FormEvent } from "react";
import Button from "../Button";

interface FormData {
  username: string;
  email: string;
  password: string;
}

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Form data will be handle here
    fetch("http://localhost:3000/api/users", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleLogin = () => {
    console.log("User clicked the Login button");
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
