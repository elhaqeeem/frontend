import React, { useState, useEffect } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';

const RoleDataTable = () => {
    const [roles, setRoles] = useState([]);
    const [editingRole, setEditingRole] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roleName, setRoleName] = useState('');
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('/roles', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRoles(response.data.roles);
        } catch (error) {
            setError('Failed to fetch roles.');
            toast.error('Failed to fetch roles.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async () => {
        const roleData = { RoleName: roleName };
        const token = localStorage.getItem('token');
        try {
            if (editingRole) {
                await axios.put(`/roles/${editingRole.ID}`, roleData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Role updated successfully.');
            } else {
                const response = await axios.post('/roles', roleData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRoles([...roles, response.data.role]);
                toast.success('Role added successfully.');
            }
            fetchRoles();
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            toast.error('Failed to save role.');
        }
    };

    const handleEdit = (role) => {
        setEditingRole(role);
        setRoleName(role.RoleName);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`/roles/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRoles(roles.filter((role) => role.ID !== id));
            toast.success('Role deleted successfully.');
        } catch (error) {
            toast.error('Failed to delete role.');
        }
    };

    const resetForm = () => {
        setEditingRole(null);
        setRoleName('');
    };

    const filteredRoles = roles.filter((role) =>
        role && role.RoleName && role.RoleName.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            name: 'ID',
            selector: (row) => row.ID,
            sortable: true,
        },
        {
            name: 'Role Name',
            selector: (row) => row.RoleName,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="flex space-x-2">
                    <button className="btn btn-outline btn-primary" onClick={() => handleEdit(row)}>
                        <i className="fa fa-pencil" aria-hidden="true"></i>
                    </button>
                    <button className="btn btn-outline btn-error" onClick={() => handleDelete(row.ID)}>
                        <i className="fa fa-trash" aria-hidden="true"></i>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="container mx-auto p-4">
            <ToastContainer />
            <input
                type="text"
                placeholder="Search roles"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="input input-bordered w-full max-w-xs mb-4"
            />
            <button
                className="btn btn-outline btn-primary mb-4"
                onClick={() => setIsModalOpen(true)}
            >
                <i className="fa fa-plus" aria-hidden="true"></i> Add Role
            </button>
            {error && <p className="text-red-500">{error}</p>}
            <DataTable
                title="Role List"
                columns={columns}
                data={filteredRoles}
                progressPending={loading}
                noDataComponent="No roles available"
                pagination
                className="rounded-lg shadow-lg bg-white"
            />

            {isModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="text-xl font-bold">
                            {editingRole ? 'Edit Role' : 'Add New Role'}
                        </h3>
                        <input
                            type="text"
                            placeholder="Role Name"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            className="input input-bordered w-full mb-2"
                        />
                        <div className="modal-action">
                            <button className="btn" onClick={handleCreateOrUpdate}>
                                {editingRole ? 'Update' : 'Create'}
                            </button>
                            <button className="btn" onClick={() => { setIsModalOpen(false); resetForm(); }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleDataTable;
