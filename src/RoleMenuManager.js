import React, { useEffect, useState, useMemo } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';

const RoleMenuManager = () => {
  const [roleMenus, setRoleMenus] = useState([]); // Initialize as an empty array
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoleMenu, setSelectedRoleMenu] = useState(null);
  const [roleId, setRoleId] = useState('');
  const [menuId, setMenuId] = useState('');

  // Fetch role menus function
  const fetchRoleMenus = async (roleId) => {
    try {
      const response = await axios.get(`/role/${roleId}/menus`);
      // Check if the response.data contains the "menus" key and is an array
      if (Array.isArray(response.data.menus)) {
        setRoleMenus(response.data.menus);
      } else {
        toast.error('Invalid data format received.');
      }
    } catch (error) {
      toast.error('Failed to fetch role menus.');
      console.error(error);
    }
  };
  
  useEffect(() => {
    const roleIdFromStorage = localStorage.getItem('roleID'); // Ensure the key matches the one used to store
    if (roleIdFromStorage) {
      fetchRoleMenus(roleIdFromStorage);
    } else {
      toast.error('Role ID tidak ditemukan di local storage.');
    }
  }, []);

  // Columns for DataTable
  const columns = [
    {
      name: 'Role ID',
      selector: (row) => row.role_id,
      sortable: true,
    },
    {
      name: 'Menu ID',
      selector: (row) => row.menu_id,
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <button onClick={() => handleEdit(row)}>Edit</button>
      ),
    },
  ];

  // Filtered role menus based on search input
  const filteredRoleMenus = useMemo(() => {
    return roleMenus.filter((roleMenu) =>
      `${roleMenu.roleId} ${roleMenu.menuId}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [roleMenus, search]);

  // Save role menu function
  const saveRoleMenu = async () => {
    if (!roleId || !menuId) {
      toast.error('Role ID and Menu ID are required.');
      return;
    }

    try {
      const response = selectedRoleMenu
        ? await axios.put(`/roles/menus/${selectedRoleMenu.id}`, { roleId, menuId })
        : await axios.post('/roles/menus', { roleId, menuId });
      toast.success(`Role Menu ${selectedRoleMenu ? 'updated' : 'added'} successfully.`);
      fetchRoleMenus(roleId); // Refresh the list
      resetForm();
    } catch (error) {
      toast.error('Failed to save role menu.');
      console.error(error);
    }
  };

  // Handle edit button click
  const handleEdit = (roleMenu) => {
    setSelectedRoleMenu(roleMenu);
    setRoleId(roleMenu.roleId);
    setMenuId(roleMenu.menuId);
    setIsModalOpen(true);
  };

  // Reset form fields
  const resetForm = () => {
    setSelectedRoleMenu(null);
    setRoleId('');
    setMenuId('');
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1>Role Menu Manager</h1>
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={() => setIsModalOpen(true)}>Add Role Menu</button>
      <DataTable
        columns={columns}
        data={filteredRoleMenus}
        pagination
      />
      {isModalOpen && (
        <div className="modal">
          <h2>{selectedRoleMenu ? 'Edit Role Menu' : 'Add Role Menu'}</h2>
          <input
            type="number"
            placeholder="Role ID"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          />
          <input
            type="number"
            placeholder="Menu ID"
            value={menuId}
            onChange={(e) => setMenuId(e.target.value)}
          />
          <button onClick={saveRoleMenu}>Save</button>
          <button onClick={resetForm}>Cancel</button>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default RoleMenuManager;
