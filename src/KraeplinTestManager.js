import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
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
  const [testId, setTestId] = useState(''); // State to hold the test ID
  const token = localStorage.getItem("token"); // Ambil token dari localStorage

  useEffect(() => {
    fetchKraeplinTests();// eslint-disable-next-line
  }, []);

  useEffect(() => {
    const result = tests.filter(test => 
      test.description.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredTests(result);
  }, [search, tests]);

  const fetchKraeplinTests = async () => {
    try {
      const response = await fetch("/kraeplin-tests", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        console.error("Authorization header required");
        return;
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setTests(data);
      } else {
        console.error("Data format is not an array:", data);
      }
    } catch (error) {
      console.error("Error fetching kraeplin tests:", error);
    }
  };
  
  
  

  const handleCreateOrUpdate = async () => {
    if (!testDate || !durationMinutes || !description) {
      toast.error('All fields are required.');
      return;
    }
  
    const formattedTestDate = new Date(testDate).toISOString(); // Convert to ISO format
  
    const testData = {
      test_date: formattedTestDate,
      duration_minutes: parseInt(durationMinutes, 10), // Ensure it's an integer
      description,
      id: testId ? parseInt(testId, 10) : undefined, // Ensure id is an integer or undefined for new entries
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
          await axios.put(`/kraeplin-tests/${testId}`, testData); // Use the testId here as a number
          toast.success('Test updated successfully.');
        }
      } else {
        await axios.post('/kraeplin-tests', testData);
        toast.success('Test created successfully.');
      }
      fetchKraeplinTests();
      resetForm();
    } catch (error) {
      toast.error('Failed to save test.');
    }
  };
  
  

  const handleEdit = (test) => {
    setSelectedTest(test);
    setTestId(test.id); // Set the test ID when editing
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
        fetchKraeplinTests();
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
    setTestId(''); // Reset the test ID
    setIsModalOpen(false);
  };

  const columns = [
    {
      name: 'ID', // Changed the column name to ID
      selector: (row) => row.id,
      sortable: true,
      cell: row => (row.id),
    },
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
        noDataComponent="No tests available"
        pagination
        className="rounded-lg shadow-lg bg-white"
      />

      {isModalOpen && (
        <div className="modal modal-open bg-dark text-black">
          <div className="modal-box max-w-lg mx-auto">
            <h2 className="font-bold text-lg">{selectedTest ? 'Edit Kraeplin Test' : 'Add Test'}</h2>
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
            {/* Replaced ReactQuill with a standard text input */}
            <input
              type="text"
              placeholder="Write the description here..."
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
