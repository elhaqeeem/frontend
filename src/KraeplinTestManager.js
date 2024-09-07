import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Swal from 'sweetalert2';

const KraeplinTestManager = () => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testDate, setTestDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [testId, setTestId] = useState('');

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    const result = tests.filter(test => 
      test.description.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredTests(result);
  }, [search, tests]);

  const fetchTests = async () => {
    try {
      const response = await axios.get('/kraeplin-tests'); // Adjust API endpoint accordingly
      setTests(response.data || []);
      setFilteredTests(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch tests.');
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!testDate || !durationMinutes || !description) {
        toast.error('All fields are required.');
        return;
    }

    const formattedTestDate = new Date(testDate).toISOString(); // This will convert it to "YYYY-MM-DDTHH:MM:SSZ"

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
                cancelButtonText: 'No, cancel!',
            });

            if (result.isConfirmed) {
                await axios.put(`/kraeplin-tests`, { ...testData, id: testId }); // Send ID in the request body
                toast.success('Test updated successfully.');
            }
        } else {
            await axios.post('/kraeplin-tests', testData);
            toast.success('Test created successfully.');
        }
        fetchTests();
        resetForm();
    } catch (error) {
        toast.error('Failed to save test.');
    }
  };

  const handleEdit = (test) => {
    setSelectedTest(test);
    setTestId(test.id);
    setTestDate(test.test_date);
    setDurationMinutes(test.duration_minutes);
    setDescription(test.description);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this test!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/kraeplin-tests/${id}`);
        toast.success('Test deleted successfully.');
        fetchTests();
      } catch (error) {
        toast.error('Failed to delete test.');
      }
    }
  };

  const resetForm = () => {
    setSelectedTest(null);
    setTestDate('');
    setDurationMinutes('');
    setDescription('');
    setTestId('');
    setIsModalOpen(false);
  };

  const columns = [
    {
      name: 'Test Date',
      selector: (row) => row.test_date,
      sortable: true,
      cell: row => new Date(row.test_date).toLocaleDateString(), // Formatting date
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
      cell: row => (
        <div dangerouslySetInnerHTML={{ __html: row.description }} />
      ),
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
          Add Kraeplin Test
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
        title="Kraeplin Test List"
        columns={columns}
        data={filteredTests}
        noDataComponent="No tests available"
        pagination
        className="rounded-lg shadow-lg bg-white"
      />

      {isModalOpen && (
        <div className="modal modal-open bg-dark text-white">
          <div className="modal-box max-w-lg mx-auto">
            <h2 className="font-bold text-lg">{selectedTest ? 'Edit Kraeplin Test' : 'Add Kraeplin Test'}</h2>
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
            <ReactQuill
              value={description}
              onChange={setDescription}
              placeholder="Write the description here..."
              className="mb-4 bg-white text-black"
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

export default KraeplinTestManager;
