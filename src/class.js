import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';

const ClassManager = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classData, setClassData] = useState({
    course_id: '',
    title: '',
    schedule: '',
    id: ''
  });
  const [selectedRows, setSelectedRows] = useState([]);

  // Fetch all classes from the API
  const fetchClasses = async () => {
    try {
      const response = await axios.get('/classes');
      setClasses(response.data.classes || []);
    } catch (error) {
      toast.error('Failed to fetch classes.');
    }
  };

  useEffect(() => {
    fetchClasses(); // Fetch classes on initial load
  }, []);

  // Filter classes based on search input
  useEffect(() => {
    if (Array.isArray(classes)) {
      setFilteredClasses(
        classes.filter((classItem) =>
          classItem.title.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, classes]);

  // Handle create or update class
  const handleCreateOrUpdate = async () => {
    const { course_id, title, schedule, id } = classData;

    if (!course_id || !title || !schedule) {
      toast.error('Course ID, Title, and Schedule are required.');
      return;
    }

    const classPayload = { 
      course_id, 
      title, 
      schedule 
    };

    const confirmationText = id ? 'update this class!' : 'create a new class!';
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
          ? await axios.put(`/classes/${id}`, classPayload)
          : await axios.post('/classes', classPayload);

        toast.success(`Class ${id ? 'updated' : 'created'} successfully.`);
        fetchClasses();
        resetForm();
      } catch (error) {
        toast.error(`Failed to ${id ? 'update' : 'create'} class.`);
      }
    }
  };

  // Open modal with class data for editing
  const handleEdit = (classItem) => {
    setClassData({
      course_id: classItem.course_id,
      title: classItem.title,
      schedule: classItem.schedule,
      id: classItem.id
    });
    setIsModalOpen(true);
  };

  // Handle delete single class
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this class!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/classes/${id}`);
        toast.success('Class deleted successfully.');
        fetchClasses();
      } catch (error) {
        toast.error('Failed to delete class.');
      }
    }
  };

  // Handle bulk delete of selected classes
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.error('No classes selected for deletion.');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedRows.length} class(es)!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: 'No, cancel!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete('/classes/bulk-delete', {
          data: { ids: selectedRows }
        });
        toast.success('Selected classes deleted successfully.');
        fetchClasses();
        setSelectedRows([]);
      } catch (error) {
        toast.error('Failed to delete selected classes.');
      }
    }
  };

  // Reset the form after creation or editing
  const resetForm = () => {
    setClassData({ course_id: '', title: '', schedule: '', id: '' });
    setIsModalOpen(false);
  };

  // Define table columns
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
      name: 'Schedule',
      selector: (row) => row.schedule,
      sortable: true,
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
    <div className="container mx-auto p-4 bg-white text-black">
      <div className="flex justify-between items-center mb-4">
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Add Class</button>
        <button className="btn btn-danger" onClick={handleBulkDelete}>Bulk Delete</button>
        <input
          type="text"
          placeholder="Search Classes"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered w-full max-w-xs pl-10"
        />
      </div>
      <DataTable
        title="Class List"
        columns={columns}
        data={filteredClasses}
        selectableRows
        pagination
        onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows.map(row => row.id))}
        className="rounded-lg shadow-lg bg-white"
      />

      {/* Modal for Create/Edit Class */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="form-control mt-4">
              <label className="label">
                <strong className="label-text-lg">{classData.id ? 'Edit' : 'Create'} Class</strong>
              </label>
              <input
                type="text"
                value={classData.title}
                onChange={(e) => setClassData({ ...classData, title: e.target.value })}
                placeholder="Title"
                className="input input-bordered w-full mb-2"
              />
            </div>
            <div className="form-control mt-4">
              <input
                type="number"
                value={classData.course_id}
                onChange={(e) => setClassData({ ...classData, course_id: e.target.value })}
                placeholder="Course ID"
                className="input input-bordered w-full mb-2"
              />
              <input
                type="datetime-local"
                value={classData.schedule}
                onChange={(e) => setClassData({ ...classData, schedule: e.target.value })}
                placeholder="Schedule"
                className="input input-bordered w-full mb-2"
              />
            </div>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={handleCreateOrUpdate}>Save</button>
              <button className="btn" onClick={resetForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer />
    </div>
  );
};

export default ClassManager;
