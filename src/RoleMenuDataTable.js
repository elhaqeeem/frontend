import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RoleMenuDataTable = () => {
    const [roleMenus, setRoleMenus] = useState([]);
    const [editingRoleMenu, setEditingRoleMenu] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roleID, setRoleID] = useState('');
    const [menuID, setMenuID] = useState('');
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedRoleID = localStorage.getItem('roleID');
        if (storedRoleID) {
            setRoleID(storedRoleID);
            fetchRoleMenus(storedRoleID);
        } else {
            setLoading(false);
            toast.error('Role ID is not set.');
        }
    }, []);

    const fetchRoleMenus = async (storedRoleID) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`/role/${storedRoleID}/menus`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data && response.data.menus) {
                setRoleMenus(response.data.menus);
            } else {
                setRoleMenus([]);
                toast.error('No menus found for this role.');
            }
        } catch (error) {
            console.error("Error fetching role menus:", error);
            setRoleMenus([]);
            toast.error('Failed to fetch role-menu associations.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async () => {
        const roleMenuData = { role_id: roleID, menu_id: menuID };
        const token = localStorage.getItem('token');
        try {
            if (editingRoleMenu) {
                await axios.put(`/roles/menus/${editingRoleMenu.id}`, roleMenuData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Role-Menu association updated successfully.');
            } else {
                const response = await axios.post('/roles/menus', roleMenuData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRoleMenus((prev) => [...prev, response.data.roleMenu]);
                toast.success('Role-Menu association added successfully.');
            }
            fetchRoleMenus(roleID); // Refresh the data after creation or update
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error("Error saving role-menu association:", error);
            toast.error('Failed to save role-menu association.');
        }
    };

    const resetForm = () => {
        setEditingRoleMenu(null);
        setMenuID('');
    };

    const filteredRoleMenus = roleMenus.filter((roleMenu) => {
        return (
            roleMenu &&
            (
                roleMenu.menu_name.toLowerCase().includes(searchText.toLowerCase()) || 
                roleMenu.url.toLowerCase().includes(searchText.toLowerCase())
            )
        );
    });

    const columns = [
        {
            name: 'Menu Name',
            selector: row => row.menu_name,
            sortable: true,
        },
        {
            name: 'URL',
            selector: row => row.url,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: row => (
                <>
                    <button className="btn btn-sm btn-primary" onClick={() => handleEdit(row)}>Edit</button>
                    <button className="btn btn-sm btn-danger ml-2" onClick={() => handleDelete(row.id)}>Delete</button>
                </>
            ),
        },
    ];

    const handleEdit = (row) => {
        setEditingRoleMenu(row);
        setMenuID(row.menu_id); // Use menu_id from the selected row
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`/roles/menus/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Role-Menu association deleted successfully.');
            fetchRoleMenus(roleID); // Refresh the data after deletion
        } catch (error) {
            console.error("Error deleting role-menu association:", error);
            toast.error('Failed to delete role-menu association.');
        }
    };

    return (
        <div className="container mx-auto p-4 bg-white text-black">
            <ToastContainer />
            <div className="flex justify-between items-center mb-4">
                <button
                    className="btn btn-outline btn-primary mb-4"
                    onClick={() => {
                        setIsModalOpen(true);
                        resetForm(); // Ensure form is reset when opening modal
                    }}
                >
                    <i className="fa fa-plus" aria-hidden="true"></i> Add Role-Menu Association
                </button>
                <input
                    type="text"
                    placeholder="Search Menu Name or URL"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="input input-bordered w-full max-w-xs mb-4"
                />
            </div>
            <DataTable
                title="Role-Menu Associations"
                columns={columns}
                data={filteredRoleMenus}
                progressPending={loading}
                noDataComponent="No role-menu associations available"
                pagination
                className="rounded-lg shadow-lg bg-white"
            />

            {isModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="text-xl font-bold">
                            {editingRoleMenu ? 'Edit Role-Menu Association' : 'Add New Role-Menu Association'}
                        </h3>
                        <input
                            type="number"
                            placeholder="Menu ID"
                            value={menuID}
                            onChange={(e) => setMenuID(e.target.value)}
                            className="input input-bordered w-full mb-2"
                            disabled // If you want to keep the input disabled, you can leave it like this
                        />
                        <div className="modal-action">
                            <button className="btn" onClick={handleCreateOrUpdate}>
                                {editingRoleMenu ? 'Update' : 'Create'}
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

export default RoleMenuDataTable;
