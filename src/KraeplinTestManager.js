import React, { useEffect, useState, useCallback } from 'react';
import axios from './axiosInstance'; // Pastikan path benar
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';

const CreateKraeplin = () => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testDate, setTestDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [testId, setTestId] = useState('');
  
  // Fetch data saat komponen dimount
  const fetchKraeplinTests = useCallback(async () => {
    try {
      const { data } = await axios.get('/kraeplin-tests');
      if (Array.isArray(data)) {
        setTests(data);
      } else {
        toast.error('Invalid data format received from server.');
      }
    } catch (error) {
      console.error('Error fetching tests:', error.response || error);
      toast.error('Failed to fetch tests.');
    }
  }, []);

  useEffect(() => {
    fetchKraeplinTests();
  }, [fetchKraeplinTests]);

  // Filter berdasarkan pencarian
  useEffect(() => {
    setFilteredTests(
      tests.filter(test =>
        test.description.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, tests]);

  // Reset form
  const resetForm = () => {
    setSelectedTest(null);
    setTestDate('');
    setDurationMinutes('');
    setDescription('');
    setTestId('');
    setIsModalOpen(false);
  };

  // Buat atau update data
  const handleCreateOrUpdate = async () => {
    if (!testDate || !durationMinutes || !description) {
      toast.error('All fields are required.');
      return;
    }

    const formattedTestDate = new Date(testDate).toISOString();
    const testData = {
      test_date: formattedTestDate,
      duration_minutes: parseInt(durationMinutes, 10),
      description,
    };

    try {
      if (selectedTest) {
        const result = await Swal.fire({
          title: 'Are you sure?',
          text: 'You are about to update this test!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, update it!',
        });
        if (result.isConfirmed) {
          await axios.put(`/kraeplin-tests/${testId}`, testData);
          toast.success('Test updated successfully.');
        }
      } else {
        await axios.post('/kraeplin-tests', testData);
        toast.success('Test created successfully.');
      }
      fetchKraeplinTests();
      resetForm();
    } catch (error) {
      console.error('Error saving test:', error.response || error);
      toast.error('Failed to save test.');
    }
  };

  // Edit data
  const handleEdit = (test) => {
    setSelectedTest(test);
    setTestId(test.id);
    setTestDate(test.test_date);
    setDurationMinutes(test.duration_minutes);
    setDescription(test.description);
    setIsModalOpen(true);
  };

  // Hapus data
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this test!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/kraeplin-tests/${id}`);
        toast.success('Test deleted successfully.');
        fetchKraeplinTests();
      } catch (error) {
        console.error('Error deleting test:', error.response || error);
        toast.error('Failed to delete test.');
      }
    }
  };

  const columns = [
    {
      name: 'ID',
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: 'Test Date',
      selector: (row) => row.test_date,
      sortable: true,
      cell: (row) => new Date(row.test_date).toLocaleDateString(),
    },
    {
      name: 'Duration (minutes)',
      selector: (row) => row.duration_minutes,
      sortable: true,
    },
    {
      name: 'Description',
      selector: (row) => row.description,
      sortable: true,
      cell: (row) => <div dangerouslySetInnerHTML={{ __html: row.description }} />,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            className="btn btn-outline btn-primary"
            onClick={() => handleEdit(row)}
          >
            <i className="fa fa-pencil"></i>
          </button>
          <button
            className="btn btn-outline btn-error"
            onClick={() => handleDelete(row.id)}
          >
            <i className="fa fa-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4 bg-white text-black">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <button
          className="btn btn-outline btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          Add Test
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
        title="Test List"
        columns={columns}
        data={filteredTests}
        pagination
        noDataComponent="No tests available"
      />

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg mx-auto">
            <h2 className="font-bold text-lg">
              {selectedTest ? 'Edit Kraeplin Test' : 'Add Test'}
            </h2>
            <input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="input input-bordered w-full mb-2"
              required
            />
            <input
              type="number"
              placeholder="Duration (minutes)"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="input input-bordered w-full mb-2"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input input-bordered w-full mb-2"
              required
            />
            <div className="modal-action">
              <button className="btn" onClick={handleCreateOrUpdate}>
                {selectedTest ? 'Update' : 'Create'}
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

export default CreateKraeplin;
