import axiosInstance from './axiosInstance';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import Swal from 'sweetalert2'; // Import SweetAlert2
import 'sweetalert2/dist/sweetalert2.min.css'; // Import CSS SweetAlert2

function Logout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You will be logged out of your session!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, logout!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                axiosInstance.post('/logout')
                    .then(response => {
                        console.log(response.data.message);
                        // Hapus semua data dari localStorage
                        localStorage.removeItem('token');
                        localStorage.removeItem('roleID');
                        localStorage.removeItem('email');
                        localStorage.removeItem('firstName');
                        localStorage.removeItem('id');

                        // Arahkan ke halaman login
                        navigate('/login');

                        // Tampilkan notifikasi sukses
                        Swal.fire('Logged out!', 'You have been successfully logged out.', 'success');
                    })
                    .catch(error => {
                        console.error('Logout failed', error);
                        Swal.fire('Error!', 'An error occurred while logging out.', 'error');
                    });
            }
        });
    };

    return (
        <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="flex items-center text-black justify-start">
            <i className="fa fa-power-off mr-2" aria-hidden="true" style={{ color: 'red' }}></i>
            Logout
        </a>
    );
}

export default Logout;
