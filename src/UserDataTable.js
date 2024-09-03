import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';

const UserDataTable = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState(''); 
    const [selectedUser, setSelectedUser] = useState(null); // State for selected user details
    const [editingUser, setEditingUser] = useState(null); 
    const [newUser, setNewUser] = useState({ Username: '', Email: '' });
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const [isEditMode, setIsEditMode] = useState(false); // Edit mode state

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('token'); 
            try {
                const response = await axios.get('/users', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUsers(response.data.users); 
            } catch (error) {
                setError(error.response ? error.response.data.error : 'An error occurred');
            } finally {
                setLoading(false); 
            }
        };

        fetchUsers(); 
    }, []);

    const filteredUsers = users.filter(user =>
        user.Username.toLowerCase().includes(searchText.toLowerCase()) ||
        user.Email.toLowerCase().includes(searchText.toLowerCase())
    );
   
    const columns = [
        { name: 'ID', selector: row => row.ID, sortable: true },
        { name: 'Username', selector: row => row.Username, sortable: true },
        { name: 'Email', selector: row => row.Email, sortable: true },
        {
            name: 'Actions',
            cell: row => (
                <div className="flex space-x-2">
                    <button className="btn btn-outline btn-info" onClick={() => handleViewDetails(row)}><i class="fa fa-search" aria-hidden="true"></i>
                    </button>
                    <button className="btn btn-outline btn-primary" onClick={() => handleEdit(row)}><i class="fa fa-pencil" aria-hidden="true"></i>

                    </button>
                    <button className="btn btn-outline btn-error" onClick={() => handleDelete(row.ID)}><i class="fa fa-trash" aria-hidden="true"></i>
                    </button>
                </div>
            ),
        },
    ];

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
        setIsEditMode(false);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(users.filter(user => user.ID !== id));
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleUpdate = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`/users/${editingUser.ID}`, editingUser, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(users.map(user => (user.ID === editingUser.ID ? response.data.user : user)));
            setEditingUser(null);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleAddUser = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('/users', newUser, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers([...users, response.data.user]);
            setNewUser({ Username: '', Email: '' });
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    return (
        <div className="container mx-auto p-4">
        <input
        type="text"
        placeholder="Search by Username or Email"
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        className="input input-bordered w-full max-w-xs mb-2"
    />
    
    <button 
        className="btn btn-outline btn-primary" 
        onClick={() => { 
            setIsModalOpen(true); 
            setIsEditMode(false); 
        }}
    >
        <i className="fa fa-plus" aria-hidden="true"></i>Add users
    </button>
    
   
            {error && <p className="text-red-500">{error}</p>}
            {isModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        {isEditMode ? (
                            <>
                                <h3 className="text-xl font-bold">Edit User</h3>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={editingUser?.Username}
                                    onChange={e => setEditingUser({ ...editingUser, Username: e.target.value })}
                                    className="input input-bordered w-full mb-2"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={editingUser?.Email}
                                    onChange={e => setEditingUser({ ...editingUser, Email: e.target.value })}
                                    className="input input-bordered w-full mb-2"
                                />
                                <div className="modal-action">
                                    <button className="btn btn-primary" onClick={handleUpdate}>Update User</button>
                                    <button className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                </div>
                            </>
                        ) : (
                            selectedUser ? (
                                <>
                                    <h3 className="text-xl font-bold">User Details</h3>
                                    <p><strong>ID:</strong> {selectedUser.ID}</p>
                                    <p><strong>Username:</strong> {selectedUser.Username}</p>
                                    <p><strong>Email:</strong> {selectedUser.Email}</p>
                                    <p><strong>Roles ID:</strong> {selectedUser.RoleID}</p>
                                    <div className="modal-action">
                                        <button className="btn" onClick={() => setIsModalOpen(false)}>Close</button>
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
                            )
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
