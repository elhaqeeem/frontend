import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import library untuk animasi
import 'react-toastify/dist/ReactToastify.css';
import { loginGrpc } from './AuthService';


const FeatureList = () => {
  const features = [

  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
  
    try {
      const response = await loginGrpc(username, password);
      console.log("Response received:", response);
    
      // Use getToken() to store the token
      if (response && typeof response.getToken === 'function') {
        localStorage.setItem("token", response.getToken());
      } else {
        console.error("Response does not have a getToken method.");
      }
  
      // Since there's no 'id' in the response, you might want to use the message or handle it differently
      if (response && typeof response.getMessage === 'function') {
        console.log("Message: ", response.getMessage());
      } else {
        console.error("Response does not have a getMessage method.");
      }
  
      toast.success("Login successful!");
      onLogin();
      navigate("/");
    } catch (err) {
      console.error("gRPC Error:", err);
      setError(err.message || "An unknown error occurred");
      toast.error(`Login Failed: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  

  return (
    <motion.div
      className="py-24 px-10"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-2 text-center"> <i className="fa fa-university" aria-hidden="true"></i>
        <i style={{ color: 'white' }}>Edu</i>
        <i><strong style={{ color: 'orange' }}>LMS</strong></i></h2>
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
        {/* 
        <div className="text-center mt-4">
          Don't have an account yet?{' '}
          <a href="/register" className="hover:underline">
            Join Now
          </a>
        </div>
       */}


      </form>
    </motion.div>
  );
};

const Login = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-white-500 to-indigo-500 flex items-center">
      <div className="card mx-auto w-full max-w-5xl shadow-xl">
        <div className="grid md:grid-cols-2 grid-cols-1 bg-base-100 rounded-xl">
        <div
  className="hero min-h-full rounded-l-xl bg-base-200"
  style={{
    backgroundImage: 'url(https://res.cloudinary.com/db8atpjwp/image/upload/e_improve,w_300,h_600,c_thumb,g_auto/v1727529449/psychedelic-paper-shapes-with-copy-space_1_ddrhft.jpg)', // Ganti dengan path gambar Anda
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
      <ToastContainer position="top-center" /> {/* Tambahkan posisi di sini */}
    </div>
  );
};

export default Login;