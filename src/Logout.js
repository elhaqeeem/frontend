import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import React from 'react';

function Logout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        axios.post('/logout')
            .then(response => {
                console.log(response.data.message);
                // Handle successful logout, e.g., remove token from localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('role_id');
                navigate('/login');
            })
            .catch(error => {
                console.error('Logout failed', error);
            });
    };

    return (
        <button onClick={handleLogout} className="block py-2 px-4 hover:bg-gray-700">
            Logout
        </button>
    );
}

export default Logout;
