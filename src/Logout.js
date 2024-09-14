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
        <button onClick={handleLogout} className="btn btn-outline btn-primary">
            <i className="fa fa-sign-out" aria-hidden="true"></i> {/* This is the logout icon */}
        </button>
    );
}

export default Logout;
