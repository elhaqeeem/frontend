import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import 'sweetalert2/dist/sweetalert2.min.css';
import DataTable from 'react-data-table-component';

const UserDataTable = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [newUser, setNewUser] = useState({
        username: '', email: '', password: '', first_name: '', last_name: '', RoleID: 0
    });

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users based on search text
    useEffect(() => {
        if (Array.isArray(users)) {
            const result = users.filter(user => 
                (user?.username?.toLowerCase().includes(searchText.toLowerCase())) || 
                (user?.email?.toLowerCase().includes(searchText.toLowerCase()))
            );
            setFilteredUsers(result);
        }
    }, [searchText, users]);

    // Fetch users from backend
    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        setLoading(true);
        try {
            const response = await axios.get('/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(response.data.users || []);
            setFilteredUsers(response.data.users || []);
        } catch (error) {
            toast.error('Failed to fetch users.');
            setError(error.response ? error.response.data.error : 'An error occurred');
            setUsers([]);
            setFilteredUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Add a new user
    const handleAddUser = async () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You are about to add a new user.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, add it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                try {
                    await axios.post('/users', newUser, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setNewUser({ username: '', email: '', password: '', first_name: '', last_name: '', RoleID: 0 });
                    toast.success('User added successfully.');
                    fetchUsers();
                    setIsModalOpen(false);
                } catch (error) {
                    toast.error('Failed to add user.');
                }
            }
        });
    };

    // Update an existing user
    const handleUpdateUser = async () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You are about to update the user.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, update it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                try {
                    await axios.put(`/users/${editingUser.ID}`, editingUser, {
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

    // Delete a user
    const handleDeleteUser = async (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
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

    // Set user for editing
    const handleEdit = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    // Define table columns
    const columns = [
        { name: 'ID', selector: row => row.id, sortable: true },
        { name: 'Username', selector: row => row.username || '', sortable: true },
        { name: 'Email', selector: row => row.email || '', sortable: true },
        {
            name: 'Actions',
            cell: row => (
                <div className="flex space-x-2">
                    <button className="btn btn-outline btn-primary" onClick={() => handleEdit(row)}>
                        <i className="fa fa-pencil" aria-hidden="true"></i>
                    </button>
                    <button className="btn btn-outline btn-error" onClick={() => handleDeleteUser(row.id)}>
                        <i className="fa fa-trash" aria-hidden="true"></i>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="container mx-auto p-4 bg-white text-black">
            <ToastContainer />
            <div className="flex justify-between items-center mb-4">
                <button className="btn btn-outline btn-primary" onClick={() => setIsModalOpen(true)}>
                    <i className="fa fa-plus" aria-hidden="true"></i> Add User
                </button>
                <input
                    type="text"
                    placeholder="Search by Username or Email"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    className="input input-bordered w-full max-w-xs mb-2"
                />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            {isModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        {editingUser ? (
                            <>
                                <h3 className="text-xl font-bold">Edit User</h3>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={editingUser.username || ''}
                                    onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                                    className="input input-bordered w-full mb-2"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={editingUser.email || ''}
                                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                                    className="input input-bordered w-full mb-2"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={editingUser.password || ''}
                                    onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                                    className="input input-bordered w-full mb-2"
                                />
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={editingUser.first_name || ''}
                                    onChange={e => setEditingUser({ ...editingUser, first_name: e.target.value })}
                                    className="input input-bordered w-full mb-2"
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={editingUser.last_name || ''}
                                    onChange={e => setEditingUser({ ...editingUser, last_name: e.target.value })}
                                    className="input input-bordered w-full mb-2"
                                />
                                <input
                                    type="number"
                                    placeholder="Role ID"
                                    value={editingUser.RoleID || ''}
                                    onChange={e => setEditingUser({ ...editingUser, RoleID: Number(e.target.value) })}
                                    className="input input-bordered w-full mb-2"
                                />
                                <div className="modal-action">
                                    <button className="btn btn-primary" onClick={handleUpdateUser}>Update User</button>
                                    <button className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold">Add New User</h3>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                    className="input input-bordered w-full mb-2"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    className="input input-bordered w-full mb-2"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    className="input input-bordered w-full mb-2"
                                />
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={newUser.first_name}
                                    onChange={e => setNewUser({ ...newUser, first_name: e.target.value })}
                                    className="input input-bordered w-full mb-2"
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={newUser.last_name}
                                    onChange={e => setNewUser({ ...newUser, last_name: e.target.value })}
                                    className="input input-bordered w-full mb-2"
                                />
                                <input
                                    type="number"
                                    placeholder="Role ID"
                                    value={newUser.RoleID}
                                    onChange={e => setNewUser({ ...newUser, RoleID: Number(e.target.value) })}
                                    className="input input-bordered w-full mb-2"
                                />
                                <div className="modal-action">
                                    <button className="btn btn-primary" onClick={handleAddUser}>Add User</button>
                                    <button className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
            <DataTable
                columns={columns}
                data={filteredUsers}
                progressPending={loading}
                pagination
                highlightOnHover
                pointerOnHover
            />
        </div>
    );
};

export default UserDataTable;
