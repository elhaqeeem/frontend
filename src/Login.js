import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from './axiosInstance';
import { Helmet } from 'react-helmet';

const FeatureList = () => {
  const features = [
    "Interactive Lessons",
    "Track Your Progress",
    "Access Anywhere Anytime"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {features.length > 0 ? (
        features.map((feature, index) => (
          <p key={index} className="py-2 text-lg text-white">
            <span className="font-semibold">{feature}</span>
          </p>
        ))
      ) : (
        <p className="text-white">No features available.</p>
      )}
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
    <div>
      <Helmet>
        <title>Login | EduLMS</title>
        <meta name="description" content="Login to access EduLMS dashboard." />
        <meta name="keywords" content="EduLMS, Learning, Dashboard" />
        <meta property="og:title" content="Login to EduLMS" />
        <meta property="og:description" content="Access your personalized dashboard on EduLMS." />
        <meta property="og:image" content="https://res.cloudinary.com/db8atpjwp/image/upload/v1738700435/fnoqahbvsxfc5zs2mlay.png" />
      </Helmet>

      <motion.div
        className="py-24 px-10"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-bold mb-4 text-center text-indigo-600">
          <i className="fa fa-university mr-2" aria-hidden="true"></i>
          <span className="text-white">Edu</span><span className="text-orange-500 font-extrabold">LMS</span>
        </h2>

        <form onSubmit={handleLogin}>
          {error && <p className="text-center text-red-500 mt-4">{error}</p>}
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
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center mt-6">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <button type="submit" className="btn mt-6 w-full btn-primary">
              Access Dashboard
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
};

const Login = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-200 to-indigo-500 flex items-center justify-center">
      <div className="card mx-auto w-full max-w-5xl shadow-xl rounded-2xl">
        <div className="grid md:grid-cols-2 grid-cols-1 bg-base-100 rounded-xl">
          <div
            className="hero min-h-full rounded-l-xl bg-base-200"
            style={{
              backgroundImage: 'url(https://res.cloudinary.com/db8atpjwp/image/upload/e_improve,w_300,h_600,c_thumb,g_auto/v1727529449/psychedelic-paper-shapes-with-copy-space_1_ddrhft.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="hero-content py-12">
              <FeatureList />
            </div>
          </div>

          <LoginForm onLogin={onLogin} />
        </div>
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default Login;
