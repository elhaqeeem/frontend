import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const FeatureList = () => {
  const features = [
    'Dark/light mode switch',
    'Redux toolkit and other utility libraries set up',
    'Calendar, Modal, Sidebar components included',
    'User-friendly documentation provided',
    'Daisy UI components and Tailwind CSS supported',
  ];

  return (
    <>
      <h1 className="text-2xl mt-8 font-bold">EduLMS Features</h1>
      {features.map((feature, index) => (
        <p key={index} className="py-2">
          ✓ <span className="font-semibold" dangerouslySetInnerHTML={{ __html: feature }} />
        </p>
      ))}
    </>
  );
};

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    axios.post('/login', { username, password })
      .then(response => {
        toast.success('Login successful!');
        localStorage.setItem('roleID', response.data.role_id);
        localStorage.setItem('token', response.data.token);
        onLogin();
        navigate('/');
      })
      .catch(error => {
        if (error.response) {
          setError(error.response.data.error);
          toast.error('Login Failed: ' + error.response.data.error);
        } else {
          setError('An error occurred. Please try again.');
          toast.error('Login Failed: An error occurred. Please try again.');
        }
      });
  };

  return (
    <div className="py-24 px-10">
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

        <div className="text-right text-primary mt-2">
          <a href="/forgot-password" className="text-sm hover:underline">
            Forgot Password?
          </a>
        </div>

        <button type="submit" className="btn mt-6 w-full btn-primary">
          Access Dashboard
        </button>

        <div className="text-center mt-4">
          Don't have an account yet?{' '}
          <a href="/register" className="hover:underline">
            Join Now
          </a>
        </div>
      </form>
    </div>
  );
};

const Login = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-base-200 flex items-center">
      <div className="card mx-auto w-full max-w-5xl shadow-xl">
        <div className="grid md:grid-cols-2 grid-cols-1 bg-base-100 rounded-xl">
          <div className="hero min-h-full rounded-l-xl bg-base-200">
            <div className="hero-content py-12">
              <div className="max-w-md">
                <h1 className="text-3xl text-center font-bold">
                  <img
                    src="https://img.freepik.com/free-vector/privacy-policy-concept-illustration_114360-7853.jpg?w=740&t=st=1705223766~exp=1705224366~hmac=7ca3fbf8bf0efe280c542a27ca99cb2fb49580f9e04f1e397409b5cd040e4862"
                    className="w-12 inline-block mr-2 mask mask-circle"
                    alt="EduLMS-logo"
                  />
                  EduLMS
                </h1>
                <div className="text-center mt-12">
                  <img
                    src="https://img.freepik.com/free-vector/computer-login-concept-illustration_114360-7962.jpg?w=740&t=st=1705223807~exp=1705224407~hmac=6a7e1b3d37caa6155fb689df5e4b86e598db633aaa841ac84a9576363f76c66d"
                    alt="EduLMS Login"
                    className="w-48 inline-block"
                  />
                </div>
                <FeatureList />
              </div>
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
