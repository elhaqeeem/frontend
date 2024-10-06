import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; // Pastikan path ini benar
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill'; // Untuk editor konten rich text
import 'react-quill/dist/quill.snow.css';

const MaterialManager = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materialData, setMaterialData] = useState({
    course_id: '',  // Diubah jadi angka di input
    title: '',
    content: '',
    id: ''
  });
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    if (Array.isArray(materials)) {
      setFilteredMaterials(
        materials.filter((material) =>
          material.title.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, materials]);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get('/materials');
      setMaterials(response.data.materials || []);
    } catch (error) {
      toast.error('Failed to fetch materials.');
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMaterialData({ ...materialData, content: response.data.url });
      toast.success('Image uploaded successfully.');
    } catch (error) {
      toast.error('Failed to upload image.');
    }
  };

  const handleCreateOrUpdate = async () => {
    const { course_id, title, content, id } = materialData;

    // Pastikan course_id adalah integer
    if (!Number.isInteger(Number(course_id)) || !title || !content) {
      toast.error('Course ID must be an integer, and Title and Content are required.');
      return;
    }

    const materialPayload = { 
      course_id: Number(course_id), // Pastikan dikirim sebagai angka
      title, 
      content 
    };

    const confirmationText = id ? 'update this material!' : 'create a new material!';
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to ${confirmationText}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed!',
      cancelButtonText: 'No, cancel!'
    });

    if (result.isConfirmed) {
      try {
        id
          ? await axios.put(`/materials/${id}`, materialPayload)
          : await axios.post('/materials', materialPayload);

        toast.success(`Material ${id ? 'updated' : 'created'} successfully.`);
        fetchMaterials();
        resetForm();
      } catch (error) {
        toast.error(`Failed to ${id ? 'update' : 'create'} material.`);
      }
    }
  };

  const handleEdit = (material) => {
    setMaterialData({
      course_id: material.course_id,
      title: material.title,
      content: material.content,
      id: material.id
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this material!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/materials/${id}`);
        toast.success('Material deleted successfully.');
        fetchMaterials();
      } catch (error) {
        toast.error('Failed to delete material.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.error('No materials selected for deletion.');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedRows.length} material(s)!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: 'No, cancel!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete('/materials/bulk-delete', {
          data: { ids: selectedRows }
        });
        toast.success('Selected materials deleted successfully.');
        fetchMaterials();
        setSelectedRows([]);
      } catch (error) {
        toast.error('Failed to delete selected materials.');
      }
    }
  };

  const resetForm = () => {
    setMaterialData({ course_id: '', title: '', content: '', id: '' });
    setIsModalOpen(false);
  };

  const columns = [
    {
      name: 'Title',
      selector: (row) => row.title,
      sortable: true,
    },
    {
      name: 'Course ID',
      selector: (row) => row.course_id,
      sortable: true,
    },
    {
      name: 'Content',
      selector: (row) => row.content,
      sortable: false,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <button className="btn btn-outline btn-primary" onClick={() => handleEdit(row)}>
            <i className="fa fa-pencil" aria-hidden="true"></i>
          </button>
          <button className="btn btn-outline btn-danger" onClick={() => handleDelete(row.id)}>
            <i className="fa fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      ),
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search Materials"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>
      <DataTable
        columns={columns}
        data={filteredMaterials}
        selectableRows
        onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows.map(row => row.id))}
      />
      <div className="flex justify-between mt-4">
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Add Material</button>
        <button className="btn btn-danger" onClick={handleBulkDelete}>Bulk Delete</button>
      </div>

      {/* Modal for Create/Edit Material */}
      <div className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">{materialData.id ? 'Edit' : 'Create'} Material</h3>
          <div className="py-4">
            <input
              type="number"  // Ubah type menjadi number agar input selalu angka
              placeholder="Course ID"
              value={materialData.course_id}
              onChange={(e) => setMaterialData({ ...materialData, course_id: e.target.value })}
              className="input input-bordered w-full mb-2"
            />
            <input
              type="text"
              placeholder="Title"
              value={materialData.title}
              onChange={(e) => setMaterialData({ ...materialData, title: e.target.value })}
              className="input input-bordered w-full mb-2"
            />
           
           <div className="form-control mt-4">
        <label className="label">Upload file material</label>
        <input 
            type="file" 
            onChange={handleImageUpload} // Pass the event directly
        />
    </div>
          </div>
          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleCreateOrUpdate}>Save</button>
            <button className="btn" onClick={resetForm}>Cancel</button>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default MaterialManager;
