import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; // Import axios instance with base URL
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import 'sweetalert2/dist/sweetalert2.min.css';
import DataTable from 'react-data-table-component';

const UserDataTable = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);// eslint-disable-next-line
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false); // New state for checking edit mode
    const [editingUser, setEditingUser] = useState(null);
    const [newUser, setNewUser] = useState({
        username: '', email: '', password: '', first_name: '', last_name: '', role_id: 0
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (Array.isArray(users)) {
            const result = users.filter(user => 
                (user?.username?.toLowerCase().includes(searchText.toLowerCase())) || 
                (user?.email?.toLowerCase().includes(searchText.toLowerCase()))
            );
            setFilteredUsers(result);
        }
    }, [searchText, users]);

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        setLoading(true);
        try {
            const response = await axios.get('/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(response.data || []);
            setFilteredUsers(response.data || []);
        } catch (error) {
            toast.error('Failed to fetch users.');
            setError(error.response ? error.response.data.error : 'An error occurred');
            setUsers([]);
            setFilteredUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You are about to add a new user.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, add it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                try {
                    await axios.post('/users', newUser, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    toast.success('User added successfully.');
                    fetchUsers();
                    setIsModalOpen(false);
                    setNewUser({ username: '', email: '', password: '', first_name: '', last_name: '', role_id: 0 });
                } catch (error) {
                    toast.error('Failed to add user.');
                }
            }
        });
    };

    const handleUpdateUser = async () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You are about to update the user.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, update it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                try {
                    await axios.put(`/users/${editingUser.id}`, editingUser, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    toast.success('User updated successfully.');
                    fetchUsers();
                    setEditingUser(null);
                    setIsModalOpen(false);
                } catch (error) {
                    toast.error('Failed to update user.');
                }
            }
        });
    };

    const handleDeleteUser = async (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                try {
                    await axios.delete(`/users/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    toast.success('User deleted successfully.');
                    fetchUsers();
                } catch (error) {
                    toast.error('Failed to delete user.');
                }
            }
        });
    };

    const handleOpenModal = (user = null) => {
        setIsEditMode(!!user);
        setIsModalOpen(true);
        if (user) {
            setEditingUser(user);
            setNewUser({
                username: user.username || '',
                email: user.email || '',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                password: '',
                role_id: user.role_id || 0,
            });
        } else {
            setNewUser({
                username: '',
                email: '',
                password: '',
                first_name: '',
                last_name: '',
                role_id: 0,
            });
        }
    };

    const columns = [
        { name: 'ID', selector: row => row.id, sortable: true },
        { name: 'Username', selector: row => row.username || '', sortable: true },
        { name: 'Email', selector: row => row.email || '', sortable: true },
        { name: 'First Name', selector: row => row.first_name || '', sortable: true },
        { name: 'Last Name', selector: row => row.last_name || '', sortable: true },
        { name: 'Role ID', selector: row => row.role_id, sortable: true },
        {
            name: 'Actions',
            cell: row => (
                <div className="flex space-x-2">
                    <button onClick={() => handleOpenModal(row)} className="btn btn-primary btn-sm">Edit</button>
                    <button onClick={() => handleDeleteUser(row.id)} className="btn btn-danger btn-sm">Delete</button>
                </div>
            ),
        },
    ];

    return (
        <div className="container mx-auto p-4 bg-white text-black">
            <ToastContainer />

            {/* Modal using daisyUI */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="modal modal-open">
                        <div className="modal-box">
                            <h2 className="text-2xl mb-4">{isEditMode ? 'Edit User' : 'Add New User'}</h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    isEditMode ? handleUpdateUser() : handleAddUser();
                                }}
                            >
                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text">Username:</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered"
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text">Email:</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="input input-bordered"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text">Password:</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="input input-bordered"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        required={!isEditMode}
                                    />
                                </div>
                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text">First Name:</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered"
                                        value={newUser.first_name}
                                        onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text">Last Name:</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered"
                                        value={newUser.last_name}
                                        onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text">Role ID:</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="input input-bordered"
                                        value={newUser.role_id}
                                        onChange={(e) => setNewUser({ ...newUser, role_id: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className="modal-action">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                                    <button type="submit" className="btn btn-primary">{isEditMode ? 'Update User' : 'Create User'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between mb-4">
                <button onClick={() => handleOpenModal()} className="btn btn-primary">Add User</button>
                <input
                    type="text"
                    placeholder="Search"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    className="input input-bordered"
                />
            </div>

            <DataTable
                columns={columns}
                data={filteredUsers}
                progressPending={loading}
                pagination
                className="rounded-lg shadow-lg bg-white"
                title="Question Test List"
        
            />
        </div>
    );
};

export default UserDataTable;
