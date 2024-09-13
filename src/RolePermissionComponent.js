import React, { useEffect, useState, useCallback } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2'; // Import SweetAlert2

const RolePermissionComponent = () => {
    const [roleID, setRoleID] = useState('');
    const [permissionID, setPermissionID] = useState('');
    const [permissions, setPermissions] = useState([]);

    const fetchPermissions = useCallback(async () => {
        if (!roleID) return; // Early exit if roleID is not set

        try {
            const response = await axios.get(`/roles/${roleID}/permissions`);
            console.log('Fetched permissions:', response.data);
            setPermissions(response.data.permissions || []); // Adjust based on your API response
        } catch (error) {
            toast.error('Failed to fetch permissions.');
            console.error(error);
        }
    }, [roleID]);

    useEffect(() => {
        fetchPermissions();
    }, [roleID, fetchPermissions]);

    const handleAddPermission = async () => {
        if (!roleID || !permissionID) {
            toast.error('Please enter both Role ID and Permission ID.');
            return;
        }

        // SweetAlert confirmation before adding permission
        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to add Permission ID: ${permissionID} to Role ID: ${roleID}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, add it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.post('/role_permissions', { 
                        role_id: parseInt(roleID, 10), 
                        permission_id: parseInt(permissionID, 10)
                    });
                    toast.success('Permission added successfully.');
                    resetForm();
                    fetchPermissions();
                } catch (error) {
                    toast.error('Failed to add permission.');
                    console.error(error);
                }
            }
        });
    };

    const handleRemovePermission = async (permID) => {
        // SweetAlert confirmation before removing permission
        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to remove Permission ID: ${permID} from Role ID: ${roleID}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete('/role_permissions', {
                        data: {
                            role_id: parseInt(roleID, 10),        // Ensure roleID is an integer
                            permission_id: parseInt(permID, 10)   // Ensure permID is an integer
                        }
                    });
                    toast.success('Permission removed successfully.');
                    fetchPermissions();
                } catch (error) {
                    toast.error('Failed to remove permission.');
                    console.error(error);
                }
            }
        });
    };

    const resetForm = () => {
        setPermissionID('');
    };

    const columns = [
        {
            name: 'Permission ID',
            selector: (row) => row.id, // Adjusted to match your API response
            sortable: true,
        },
        {
            name: 'Permission Name',
            selector: (row) => row.permission_name, // Adjusted to match your API response
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (row) => (
                <button className="btn btn-outline btn-error" onClick={() => handleRemovePermission(row.id)}>
                    <i className="fa fa-trash" aria-hidden="true"></i>
                </button>
            ),
        },
    ];

    return (
        <div className="container mx-auto p-4 bg-white text-black">
            <ToastContainer />
            <div className="flex justify-between items-center mb-4">
                <button className="btn btn-outline btn-primary mb-4" onClick={handleAddPermission}>
                    <i className="fa fa-plus" aria-hidden="true"></i> Add Permission
                </button>
                <input
                    type="text"
                    placeholder="Role ID"
                    value={roleID}
                    onChange={(e) => setRoleID(e.target.value)}
                    className="input input-bordered w-full max-w-xs mb-2"
                />
                <input
                    type="text"
                    placeholder="Permission ID"
                    value={permissionID}
                    onChange={(e) => setPermissionID(e.target.value)}
                    className="input input-bordered w-full max-w-xs mb-2"
                />
            </div>
            <DataTable
                title="Current Permissions"
                columns={columns}
                data={permissions}
                noDataComponent="No permissions assigned to this role"
                pagination
                className="rounded-lg shadow-lg bg-white"
            />
        </div>
    );
};

export default RolePermissionComponent;
