import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import library untuk animasi
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from './axiosInstance';

const FeatureList = () => {
  const features = [
    '🌙 Dark/light mode switch',
    '⚡ Redux toolkit and utility libraries set up',
    '📅 Calendar, Modal, Sidebar components included',
    '📘 User-friendly documentation provided',
    '✨ Daisy UI components and Tailwind CSS supported',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-2xl mt-8 font-bold">EduLMS Features</h1>
      {features.map((feature, index) => (
        <p key={index} className="py-2">
          <span className="font-semibold">{feature}</span>
        </p>
      ))}
    </motion.div>
  );
};

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    axiosInstance
      .post('/login', { username, password })
      .then((response) => {
        toast.success('Login successful!');
        localStorage.setItem('roleID', response.data.role_id);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('id', response.data.id);
        localStorage.setItem('email', response.data.email);
        localStorage.setItem('firstName', response.data.firstName);

        onLogin();
        navigate('/');
      })
      .catch((error) => {
        if (error.response) {
          setError(error.response.data.error);
          toast.error('Login Failed: ' + error.response.data.error);
        } else {
          setError('An error occurred. Please try again.');
          toast.error('Login Failed: An error occurred. Please try again.');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <motion.div
      className="py-24 px-10"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-2 text-center">Login</h2>
      <form onSubmit={handleLogin}>
        {error && <p className="text-center text-error mt-4">{error}</p>}
        <div className="form-control w-full mt-4">
          <label className="label">
            <span className="label-text text-base-content">Username</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-control w-full mt-4">
          <label className="label">
            <span className="label-text text-base-content">Password</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center mt-6">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"></div>
          </div>
        ) : (
          <button type="submit" className="btn mt-6 w-full btn-primary">
            Access Dashboard
          </button>
        )}

        <div className="text-center mt-4">
          Don't have an account yet?{' '}
          <a href="/register" className="hover:underline">
            Join Now
          </a>
        </div>
      </form>
    </motion.div>
  );
};

const Login = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center">
      <div className="card mx-auto w-full max-w-5xl shadow-xl">
        <div className="grid md:grid-cols-2 grid-cols-1 bg-base-100 rounded-xl">
          <div className="hero min-h-full rounded-l-xl bg-base-200">
            <div className="hero-content py-12">
              <FeatureList />
            </div>
          </div>
          <LoginForm onLogin={onLogin} />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
