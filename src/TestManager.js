import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';

const TestManager = () => {
  const [tests, setTests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testName, setTestName] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [testId, setTestId] = useState('');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await axios.get('/tests');
      if (response.data && Array.isArray(response.data.tests)) {
        setTests(response.data.tests);
      } else {
        setTests([]);
      }
    } catch (error) {
      toast.error('Failed to fetch tests.');
      setTests([]);
    }
  };

  const handleCreateOrUpdate = async () => {
    const testData = {
      name: testName,
    };

    try {
      if (selectedTest) {
        // Update existing test
        await axios.put(`/tests/${testId}`, testData);
        toast.success('Test updated successfully.');
      } else {
        // Create new test
        await axios.post('/tests', testData);
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
    setTestName(test.name);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/tests/${id}`);
      toast.success('Test deleted successfully.');
      fetchTests();
    } catch (error) {
      toast.error('Failed to delete test.');
    }
  };

  const resetForm = () => {
    setSelectedTest(null);
    setTestName('');
    setTestId('');
    setIsModalOpen(false);
  };

  const columns = [
    {
      name: 'Test Name',
      selector: (row) => row.name,
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
    <div className="container mx-auto p-4">
      <ToastContainer />
      <button className="btn btn-outline btn-primary mb-4" onClick={() => setIsModalOpen(true)}>
        Add Test
      </button>

      <DataTable
        title="Test List"
        columns={columns}
        data={tests}
        noDataComponent="No tests available"
        pagination
      />

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="font-bold text-lg">{selectedTest ? 'Edit Test' : 'Add Test'}</h2>
            <input
              type="text"
              placeholder="Test Name"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
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

export default TestManager;
