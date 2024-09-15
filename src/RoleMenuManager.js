import React, { useEffect, useState, useMemo } from 'react';
import axios from './axiosInstance'; // Pastikan path ini benar
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa'; // Import icon

const RoleMenuManager = () => {
  const [roleMenus, setRoleMenus] = useState([]); // Inisialisasi sebagai array kosong
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoleMenu, setSelectedRoleMenu] = useState(null);
  const [roleId, setRoleId] = useState('');
  const [menuId, setMenuId] = useState('');

  // Fungsi untuk mengambil data role menus
  const fetchRoleMenus = async (roleId) => {
    try {
      const response = await axios.get(`/role/${roleId}/menus`);
      if (Array.isArray(response.data.menus)) {
        setRoleMenus(response.data.menus);
      } else {
        toast.error('Format data yang diterima tidak valid.');
      }
    } catch (error) {
      toast.error('Gagal mengambil data role menus.');
      console.error(error);
    }
  };

  useEffect(() => {
    const roleIdFromStorage = localStorage.getItem('roleID');
    if (roleIdFromStorage) {
      fetchRoleMenus(roleIdFromStorage);
    } else {
      toast.error('Role ID tidak ditemukan di local storage.');
    }
  }, []);

  // Kolom untuk DataTable
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
        <>
          <button className="btn-icon" onClick={() => handleEdit(row)}>
            <FaEdit /> {/* Ikon edit */}
          </button>
          <button className="btn-icon" onClick={() => handleDelete(row.id)}>
            <FaTrashAlt /> {/* Ikon delete */}
          </button>
        </>
      ),
    },
  ];

  // Filter role menus berdasarkan input pencarian
  const filteredRoleMenus = useMemo(() => {
    return roleMenus.filter((roleMenu) =>
      `${roleMenu.role_id} ${roleMenu.menu_id}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [roleMenus, search]);

  // Fungsi untuk menyimpan role menu
  const saveRoleMenu = async () => {
    if (!roleId || !menuId) {
      toast.error('Role ID dan Menu ID harus diisi.');
      return;
    }
  
    try {
      let response;
      if (selectedRoleMenu) {
        // Edit role menu
        response = await axios.put(`/roles/menus/${selectedRoleMenu.id}`, { role_id: roleId, menu_id: menuId });
      } else {
        // Tambah role menu
        response = await axios.post('/roles/menus', { role_id: roleId, menu_id: menuId });
      }
  
      toast.success(`Role Menu ${selectedRoleMenu ? 'diperbarui' : 'ditambahkan'} dengan sukses.`);
      fetchRoleMenus(localStorage.getItem('roleID')); // Refresh data dengan role ID yang ada
      resetForm(); // Tutup modal dan reset form
    } catch (error) {
      toast.error('Gagal menyimpan role menu.');
      console.error(error.response ? error.response.data : error.message);
    }
  };
  

  // Fungsi untuk menangani klik tombol edit
  const handleEdit = (roleMenu) => {
    setSelectedRoleMenu(roleMenu);
    setRoleId(roleMenu.role_id);
    setMenuId(roleMenu.menu_id);
    setIsModalOpen(true);
  };

  // Fungsi untuk menangani klik tombol delete
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Anda akan menghapus role menu ini!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/roles/menus/${id}`);
        toast.success('Role menu berhasil dihapus.');
        fetchRoleMenus(roleId); // Refresh data
      } catch (error) {
        toast.error('Gagal menghapus role menu.');
        console.error(error);
      }
    }
  };

  // Reset form input
  const resetForm = () => {
    setSelectedRoleMenu(null);
    setRoleId('');
    setMenuId('');
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1>Role Menu Manager</h1>
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-search"
        />
        <button className="btn-add" onClick={() => setIsModalOpen(true)}>
          <FaPlus /> Add Role Menu {/* Ikon tambah */}
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredRoleMenus}
        pagination
        className="rounded-lg shadow-lg bg-white"

      />

      {isModalOpen && (
        <div className="modal">
          <h2>{selectedRoleMenu ? 'Edit Role Menu' : 'Tambah Role Menu'}</h2>
          <input
            type="number"
            placeholder="Role ID"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Menu ID"
            value={menuId}
            onChange={(e) => setMenuId(e.target.value)}
            className="input-field"
          />
          <div className="modal-actions">
            <button className="btn-save" onClick={saveRoleMenu}>
              Save
            </button>
            <button className="btn-cancel" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default RoleMenuManager;
