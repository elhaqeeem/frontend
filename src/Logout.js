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
                localStorage.removeItem('roleID');
                localStorage.removeItem('email');
                localStorage.removeItem('firstName');
                // localStorage.removeItem('htmx-history-cache');
                localStorage.removeItem('id');
                //localStorage.removeItem('permissions');

                navigate('/login');
            })
            .catch(error => {
                console.error('Logout failed', error);
            });
    };

    return (
        <a href onClick={handleLogout} className="flex items-center text-black justify-start">
            <i className="fa fa-power-off mr-2" aria-hidden="true" style={{ color: 'red' }}></i>
            Logout {/* This is the logout icon */}
        </a>
    );
}

export default Logout;
