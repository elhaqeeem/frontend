import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';

const UserDataTable = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');
    // eslint-disable-next-line
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [newUser, setNewUser] = useState({ Username: '', Email: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const result = users.filter(user =>
            user.Username.toLowerCase().includes(searchText.toLowerCase()) ||
            user.Email.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredUsers(result);
    }, [searchText, users]);

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(response.data.users);
            setFilteredUsers(response.data.users);
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
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('/users', newUser, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers([...users, response.data.user]);
            setNewUser({ Username: '', Email: '' });
            toast.success('User added successfully.');
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Failed to add user.');
        }
    };

    const handleUpdateUser = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`/users/${editingUser.ID}`, editingUser, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(users.map(user => (user.ID === editingUser.ID ? response.data.user : user)));
            toast.success('User updated successfully.');
            setEditingUser(null);
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Failed to update user.');
        }
    };

    const handleDeleteUser = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(users.filter(user => user.ID !== id));
            toast.success('User deleted successfully.');
        } catch (error) {
            toast.error('Failed to delete user.');
        }
    };

    const columns = [
        { name: 'ID', selector: row => row.ID, sortable: true },
        { name: 'Username', selector: row => row.Username, sortable: true },
        { name: 'Email', selector: row => row.Email, sortable: true },
        {
            name: 'Actions',
            cell: row => (
                <div className="flex space-x-2">
                    <button className="btn btn-outline btn-info" onClick={() => handleViewDetails(row)}>
                        <i className="fa fa-search" aria-hidden="true"></i>
                    </button>
                    <button className="btn btn-outline btn-primary" onClick={() => handleEdit(row)}>
                        <i className="fa fa-pencil" aria-hidden="true"></i>
                    </button>
                    <button className="btn btn-outline btn-error" onClick={() => handleDeleteUser(row.ID)}>
                        <i className="fa fa-trash" aria-hidden="true"></i>
                    </button>
                </div>
            ),
        },
    ];

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

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
                                    value={editingUser.Username}
                                    onChange={e => setEditingUser({ ...editingUser, Username: e.target.value })}
                                    className="input input-bordered w-full mb-2"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={editingUser.Email}
                                    onChange={e => setEditingUser({ ...editingUser, Email: e.target.value })}
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
                                    value={newUser.Username}
                                    onChange={e => setNewUser({ ...newUser, Username: e.target.value })}
                                    className="input input-bordered w-full mb-2"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={newUser.Email}
                                    onChange={e => setNewUser({ ...newUser, Email: e.target.value })}
                                    className="input input-bordered w-full mb-2"
                                />
                                <div className="modal-action">
                                    <button className="btn btn-warning" onClick={handleAddUser}>Add User</button>
                                    <button className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
            <DataTable
                title="User List"
                columns={columns}
                data={filteredUsers}
                progressPending={loading}
                noDataComponent="No users available"
                pagination
                className="rounded-lg shadow-lg bg-white"
            />
        </div>
    );
};

export default UserDataTable;
