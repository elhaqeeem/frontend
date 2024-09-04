import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';

const MenuIconManager = () => {
  const [menuIcons, setMenuIcons] = useState([]);
  const [filteredMenuIcons, setFilteredMenuIcons] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [iconName, setIconName] = useState('');
  const [iconPath, setIconPath] = useState('');
  const [selectedMenuIcon, setSelectedMenuIcon] = useState(null);
  const [iconId, setIconId] = useState('');

  useEffect(() => {
    fetchMenuIcons();
  }, []);

  useEffect(() => {
    const result = menuIcons.filter(icon => 
      icon.icon_name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredMenuIcons(result);
  }, [search, menuIcons]);

  const fetchMenuIcons = async () => {
    try {
      const response = await axios.get('/menu/icons');
      setMenuIcons(response.data || []);
      setFilteredMenuIcons(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch menu icons.');
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!iconName || !iconPath) {
      toast.error('Icon name and path are required.');
      return;
    }

    const iconData = {
      icon_name: iconName,
      icon_path: iconPath,
    };

    try {
      if (selectedMenuIcon) {
        const result = await Swal.fire({
          title: 'Are you sure?',
          text: 'You are about to update this menu icon!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, update it!',
          cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
          await axios.put(`/menu/icons/${iconId}`, iconData);
          toast.success('Menu icon updated successfully.');
        }
      } else {
        await axios.post('/menu/icons', iconData);
        toast.success('Menu icon created successfully.');
      }
      fetchMenuIcons();
      resetForm();
    } catch (error) {
      toast.error('Failed to save menu icon.');
    }
  };

  const handleEdit = (icon) => {
    setSelectedMenuIcon(icon);
    setIconId(icon.id);
    setIconName(icon.icon_name);
    setIconPath(icon.icon_path);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this menu icon!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/menu/icons/${id}`);
        toast.success('Menu icon deleted successfully.');
        fetchMenuIcons();
      } catch (error) {
        toast.error('Failed to delete menu icon.');
      }
    }
  };

  const resetForm = () => {
    setSelectedMenuIcon(null);
    setIconName('');
    setIconPath('');
    setIconId('');
    setIsModalOpen(false);
  };

  const columns = [
    {
      name: 'Icon Name',
      selector: (row) => row.icon_name,
      sortable: true,
    },
    {
      name: 'Icon Path',
      selector: (row) => row.icon_path,
      sortable: true,
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
    <div className="container mx-auto p-4 bg-white text-black">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <button className="btn btn-outline btn-primary" onClick={() => setIsModalOpen(true)}>
          Add Menu Icon
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
        title="Menu Icon List"
        columns={columns}
        data={filteredMenuIcons}
        noDataComponent="No menu icons available"
        pagination
        className="rounded-lg shadow-lg bg-white"
      />

      {isModalOpen && (
        <div className="modal modal-open bg-dark text-white">
          <div className="modal-box max-w-lg mx-auto">
            <h2 className="font-bold text-lg">{selectedMenuIcon ? 'Edit Menu Icon' : 'Add Menu Icon'}</h2>
            <input
              type="text"
              placeholder="Icon Name"
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              className="input input-bordered w-full mb-2"
              required  
            />
            <input
              type="text"
              placeholder="Icon Path"
              value={iconPath}
              onChange={(e) => setIconPath(e.target.value)}
              className="input input-bordered w-full mb-2"
              required  
            />
            <div className="modal-action">
              <button className="btn" onClick={handleCreateOrUpdate}>
                {selectedMenuIcon ? 'Update' : 'Create'}
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

export default MenuIconManager;
