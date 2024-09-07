import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; // Make sure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';

const MenuManager = () => {
  const [menus, setMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]); // Stores search results
  const [search, setSearch] = useState(''); // State for search input
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuName, setMenuName] = useState('');
  const [url, setUrl] = useState('');
  const [parentId, setParentId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [iconId, setIconId] = useState(null); // Use consistent casing
  const [selectedMenu, setSelectedMenu] = useState(null);

  useEffect(() => {
    fetchMenus();
  }, []);

  useEffect(() => {
    const result = menus.filter(menu => 
      menu.menu_name.toLowerCase().includes(search.toLowerCase()) ||
      menu.url.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredMenus(result);
  }, [search, menus]); // Effect to filter data when search input changes

  const fetchMenus = async () => {
    try {
      const response = await axios.get('/menus');
      if (response.data && Array.isArray(response.data.menus)) {
        setMenus(response.data.menus);
        setFilteredMenus(response.data.menus); // Initialize search results
      } else {
        setMenus([]);
        setFilteredMenus([]);
      }
    } catch (error) {
      toast.error('Failed to fetch menus.');
      setMenus([]);
      setFilteredMenus([]);
    }
  };

  const handleCreateOrUpdate = async () => {
    const menuData = {
      menu_name: menuName,
      url,
      parent_id: parentId,
      role_id: roleId,
      icon_id: iconId, // Use consistent casing
    };

    try {
      if (selectedMenu) {
        // Update existing menu
        console.log('Updating menu:', selectedMenu.id, menuData); // Debugging line
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
      console.error('Failed to save menu:', error); // Debugging line
      toast.error('Failed to save menu.');
    }
  };

  const handleEdit = (menu) => {
    console.log('Editing menu:', menu); // Debugging line
    setSelectedMenu(menu);
    setMenuName(menu.menu_name);
    setUrl(menu.url);
    setParentId(menu.parent_id || null);
    setRoleId(menu.role_id || null);
    setIconId(menu.icon_id || null); // Use consistent casing

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
    setIconId(null); // Use consistent casing
    setIsModalOpen(false);
  };

  const columns = [
    {
      name: 'Menu ID',
      selector: (row) => row.id,
      sortable: true,
    },
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
      name: 'Icon ID',
      selector: (row) => row.icon_id, // Use consistent casing
      sortable: true,
      cell: (row) => (row.icon_id !== null ? row.icon_id : 'None'), // Use consistent casing
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
    <div className="container mx-auto p-4 bg-white text-black">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <button className="btn btn-outline btn-primary" onClick={() => setIsModalOpen(true)}>
          Add Menu
        </button>
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full max-w-xs pl-10"
          />
          <i className="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      <DataTable
        title="Menu List"
        columns={columns}
        data={filteredMenus}
        noDataComponent="No menus available"
        pagination
        className="rounded-lg shadow-lg bg-white"
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
             <input
              type="number"
              placeholder="Icon ID"
              value={iconId || ''} // Use consistent casing
              onChange={(e) => setIconId(e.target.value ? parseInt(e.target.value) : null)} // Use consistent casing
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