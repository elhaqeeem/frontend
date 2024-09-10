import React, { useEffect, useState, useMemo } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';

const TestResultManager = () => {
  const [testResults, setTestResults] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testResult, setTestResult] = useState({
    userTestId: '',
    correctAnswers: '',
    totalTimeSeconds: '',
  });
  const [selectedTestResult, setSelectedTestResult] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    fetchTestResults();
  }, []);

  const fetchTestResults = async () => {
    try {
      const response = await axios.get('/test-results');
      setTestResults(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch test results.');
      console.error('Error fetching test results:', error);
    }
  };

  const saveTestResult = async () => {
    if (!testResult.userTestId || !testResult.correctAnswers || !testResult.totalTimeSeconds) {
      toast.error('All fields are required.');
      return;
    }

    try {
      if (selectedTestResult) {
        // Update existing test result
        await axios.put(`/test-results/${selectedTestResult.id}`, testResult);
        toast.success('Test result updated successfully.');
      } else {
        // Create new test result
        await axios.post('/test-results', testResult);
        toast.success('Test result created successfully.');
      }
      fetchTestResults();
      resetForm();
    } catch (error) {
      toast.error('Failed to save test result.');
      console.error('Error saving test result:', error);
    }
  };

  const handleEdit = (result) => {
    setSelectedTestResult(result);
    setTestResult({
      userTestId: result.userTestId,
      correctAnswers: result.correctAnswers,
      totalTimeSeconds: result.totalTimeSeconds,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this test result!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/test-results/${id}`);
        toast.success('Test result deleted successfully.');
        fetchTestResults();
      } catch (error) {
        toast.error('Failed to delete test result.');
        console.error('Error deleting test result:', error);
      }
    }
  };

  const resetForm = () => {
    setSelectedTestResult(null);
    setTestResult({ userTestId: '', correctAnswers: '', totalTimeSeconds: '' });
    setIsModalOpen(false);
  };

  const filteredTestResults = useMemo(() => {
    return testResults.filter((result) =>
      result.userTestId.toString().includes(search)
    );
  }, [search, testResults]);

  const columns = [
    {
      name: 'User Test ID',
      selector: (row) => row.userTestId,
      sortable: true,
    },
    {
      name: 'Correct Answers',
      selector: (row) => row.correctAnswers,
      sortable: true,
    },
    {
      name: 'Total Time (seconds)',
      selector: (row) => row.totalTimeSeconds,
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <button className="btn btn-outline btn-primary" onClick={() => handleEdit(row)}>
            Edit
          </button>
          <button className="btn btn-outline btn-danger" onClick={() => handleDelete(row.id)}>
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
          Add Test Result
        </button>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by User Test ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={filteredTestResults}
        selectableRows
        onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
      />

      {/* Modal for Add/Edit Test Result */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-box">
            <h3>{selectedTestResult ? 'Edit Test Result' : 'Add Test Result'}</h3>
            <div>
              <label>User Test ID</label>
              <input
                type="number"
                value={testResult.userTestId}
                onChange={(e) => setTestResult({ ...testResult, userTestId: e.target.value })}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label>Correct Answers</label>
              <input
                type="number"
                value={testResult.correctAnswers}
                onChange={(e) => setTestResult({ ...testResult, correctAnswers: e.target.value })}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label>Total Time (seconds)</label>
              <input
                type="number"
                value={testResult.totalTimeSeconds}
                onChange={(e) => setTestResult({ ...testResult, totalTimeSeconds: e.target.value })}
                className="input input-bordered w-full"
              />
            </div>
            <div className="modal-action">
              <button className="btn" onClick={saveTestResult}>
                Save
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

export default TestResultManager;
