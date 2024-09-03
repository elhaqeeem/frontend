import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';

const MenuManager = () => {
  const [menus, setMenus] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuName, setMenuName] = useState('');
  const [url, setUrl] = useState('');
  const [parentId, setParentId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await axios.get('/menus');
      if (response.data && Array.isArray(response.data.menus)) {
        setMenus(response.data.menus);
      } else {
        setMenus([]); // Default to empty array if data is not as expected
      }
    } catch (error) {
      toast.error('Failed to fetch menus.');
      setMenus([]); // Default to empty array in case of an error
    }
  };

  const handleCreateOrUpdate = async () => {
    const menuData = {
      menu_name: menuName,
      url,
      parent_id: parentId,
      role_id: roleId,
    };

    try {
      if (selectedMenu) {
        // Update existing menu
        await axios.put(`/menus/${selectedMenu.id}`, menuData);
        toast.success('Menu updated successfully.');
      } else {
        // Create new menu
        await axios.post('/menus', menuData);
        toast.success('Menu created successfully.');
      }
      fetchMenus();
      resetForm();
    } catch (error) {
      toast.error('Failed to save menu.');
    }
  };

  const handleEdit = (menu) => {
    setSelectedMenu(menu);
    setMenuName(menu.menu_name);
    setUrl(menu.url);
    setParentId(menu.parent_id || null);
    setRoleId(menu.role_id || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/menus/${id}`);
      toast.success('Menu deleted successfully.');
      fetchMenus();
    } catch (error) {
      toast.error('Failed to delete menu.');
    }
  };

  const resetForm = () => {
    setSelectedMenu(null);
    setMenuName('');
    setUrl('');
    setParentId(null);
    setRoleId(null);
    setIsModalOpen(false);
  };

  const columns = [
    {
      name: 'Menu Name',
      selector: (row) => row.menu_name,
      sortable: true,
    },
    {
      name: 'URL',
      selector: (row) => row.url,
      sortable: true,
    },
    {
      name: 'Parent ID',
      selector: (row) => row.parent_id,
      sortable: true,
      cell: (row) => (row.parent_id !== null ? row.parent_id : 'None'),
    },
    {
      name: 'Role ID',
      selector: (row) => row.role_id,
      sortable: true,
      cell: (row) => (row.role_id !== null ? row.role_id : 'None'),
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <button className="btn btn-outline btn-primary" onClick={() => handleEdit(row)}>
            Edit
          </button>
          <button className="btn btn-outline btn-error" onClick={() => handleDelete(row.id)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <button className="btn btn-outline btn-primary mb-4" onClick={() => setIsModalOpen(true)}>
        Add Menu
      </button>

      <DataTable
        title="Menu List"
        columns={columns}
        data={menus}
        noDataComponent="No menus available"
        pagination
      />

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="font-bold text-lg">{selectedMenu ? 'Edit Menu' : 'Add Menu'}</h2>
            <input
              type="text"
              placeholder="Menu Name"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              className="input input-bordered w-full mb-2"
              required
            />
            <input
              type="text"
              placeholder="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input input-bordered w-full mb-2"
            />
            <input
              type="number"
              placeholder="Parent ID"
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value ? parseInt(e.target.value) : null)}
              className="input input-bordered w-full mb-2"
            />
            <input
              type="number"
              placeholder="Role ID"
              value={roleId || ''}
              onChange={(e) => setRoleId(e.target.value ? parseInt(e.target.value) : null)}
              className="input input-bordered w-full mb-2"
            />
            <div className="modal-action">
              <button className="btn" onClick={handleCreateOrUpdate}>
                {selectedMenu ? 'Update' : 'Create'}
              </button>
              <button className="btn" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManager;
