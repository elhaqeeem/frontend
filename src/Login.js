import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        axios.post('/login', { username, password })
            .then(response => {
                toast.success('Login successful!');
                console.log('Login successful:', response.data);
                localStorage.setItem('roleID', response.data.role_id); // Save token
                localStorage.setItem('token', response.data.token); // Save token
                onLogin(); // Update authentication status
                navigate('/'); // Redirect to dashboard after login
               
            })
            .catch(error => {
                if (error.response) {
                    setError(error.response.data.error);
                    toast.error('Login Failed', error.response.data.error, 'error');
                } else {
                    setError('An error occurred. Please try again.');
                    toast.error('Login Failed', 'An error occurred. Please try again.', 'error');
                }
            });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
                <h1 className="mb-4 text-2xl font-bold text-center">  <span className="mr-2"><i class="fa fa-globe" aria-hidden="true"></i>
                Edu<strong>LMS</strong></span></h1>
                <form onSubmit={handleLogin}>
                    {error && <p className="mb-4 text-red-500" align="center">{error}</p>}
                    <div className="mb-4">
                        <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            id="username"
                            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'} // Toggle between text and password
                                id="password"
                                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                onClick={() => setShowPassword(!showPassword)} // Toggle show/hide password
                            >
                                {showPassword ? (
                                    <span className="text-gray-500">Hide</span> // Text when password is visible
                                ) : (
                                    <span className="text-gray-500">Show</span> // Text when password is hidden
                                )}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        Login
                    </button>
                </form>
            </div>
            <ToastContainer /> {/* Ensure ToastContainer is included here */}
        </div>
    );
}

export default Login;
