import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';

const PermissionDataTable = () => {
    const [permissions, setPermissions] = useState([]);
    const [selectedPermission, setSelectedPermission] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [permissionName, setPermissionName] = useState('');
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            const response = await axios.get('/permissions');
            console.log(response.data.permissions); // Log the permissions data
            setPermissions(response.data.permissions);
        } catch (error) {
            toast.error('Failed to fetch permissions.');
        }
    };

    const handleCreateOrUpdate = async () => {
        const permissionData = { permission_name: permissionName };
        try {
            if (selectedPermission) {
                await axios.put(`/permissions/${selectedPermission.id}`, permissionData);
                toast.success('Permission updated successfully.');
            } else {
                await axios.post('/permissions', permissionData);
                toast.success('Permission created successfully.');
            }
            fetchPermissions();
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            toast.error('Failed to save permission.');
        }
    };

    const handleEdit = (permission) => {
        setSelectedPermission(permission);
        setPermissionName(permission.permission_name);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/permissions/${id}`);
            toast.success('Permission deleted successfully.');
            fetchPermissions();
        } catch (error) {
            toast.error('Failed to delete permission.');
        }
    };

    const resetForm = () => {
        setSelectedPermission(null);
        setPermissionName('');
    };

    const filteredPermissions = permissions.filter((permission) => {
        return permission && permission.permission_name && permission.permission_name.toLowerCase().includes(searchValue.toLowerCase());
    });

    const columns = [
        {
            name: 'ID',
            selector: (row) => row.id,
            sortable: true,
        },
        {
            name: 'Permission Name',
            selector: (row) => row.permission_name,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="flex space-x-2">
                    <button className="btn btn-outline btn-primary" onClick={() => handleEdit(row)}>
                    <i className="fa fa-pencil" aria-hidden="true"></i>  
                    </button>
                    <button className="btn btn-outline btn-error" onClick={() => handleDelete(row.id)}>
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
                placeholder="Search by Permission Name"
                className="input input-bordered w-full max-w-xs mb-2"
                onChange={(e) => setSearchValue(e.target.value)}
            />
            <button className="btn btn-outline btn-primary mb-4" onClick={() => setIsModalOpen(true)}>
                <i className="fa fa-plus" aria-hidden="true"></i> Add Permission
            </button>

            <DataTable
                title="Permission List"
                columns={columns}
                data={filteredPermissions}
                noDataComponent="No permissions available"
                pagination
                className="rounded-lg shadow-lg bg-white"

                
            />

            {isModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h2 className="font-bold text-lg">{selectedPermission ? 'Edit Permission' : 'Add Permission'}</h2>
                        <input
                            type="text"
                            placeholder="Permission Name"
                            value={permissionName}
                            onChange={(e) => setPermissionName(e.target.value)}
                            className="input input-bordered w-full mb-2"
                        />
                        <div className="modal-action">
                            <button className="btn" onClick={handleCreateOrUpdate}>
                                {selectedPermission ? 'Update' : 'Create'}
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

export default PermissionDataTable;
