import React, { useState } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';

const TestResultManager = () => {
  const [testResults, setTestResults] = useState([]);
  const [search, setSearch] = useState('');
  const [searchDate, setSearchDate] = useState(''); // New state for date search
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testResult, setTestResult] = useState({
    userTestId: '',
    correctAnswers: '',
    totalQuestions: '',
    totalTimeSeconds: '',
  });
  const [selectedTestResult, setSelectedTestResult] = useState(null);

  const fetchTestResultById = async () => {
    if (!search) {
      toast.error('Please enter a User Test ID.');
      return;
    }

    try {
      const response = await axios.get(`/user-tests/results/${search}`);
      if (response.data) {
        setTestResults([response.data]); // Only one result returned
      } else {
        setTestResults([]); // No result found
        toast.info('No test result found for the given User Test ID.');
      }
    } catch (error) {
      toast.error('Failed to fetch test result.');
      console.error('Error fetching test result:', error);
    }
  };

  const fetchTestResultsByDate = async () => {
    if (!searchDate) {
      toast.error('Please select a date.');
      return;
    }

    try {
      const response = await axios.get(`/test-answers/by-date`, {
        params: { date: searchDate },
      });
      if (response.data && response.data.length > 0) {
        setTestResults(response.data);
      } else {
        setTestResults([]);
        toast.info('No test results found for the selected date.');
      }
    } catch (error) {
      toast.error('Failed to fetch test results by date.');
      console.error('Error fetching test results by date:', error);
    }
  };

  const handleEdit = (result) => {
    setSelectedTestResult(result);
    setTestResult({
      userTestId: result.user_test_id,
      correctAnswers: result.correct_answers,
      totalQuestions: result.total_questions,
      totalTimeSeconds: result.total_time_seconds,
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
        await axios.delete(`/user-tests/results/${id}`);
        toast.success('Test result deleted successfully.');
        setTestResults([]); // Clear the data after deletion
      } catch (error) {
        toast.error('Failed to delete test result.');
        console.error('Error deleting test result:', error);
      }
    }
  };

  const resetForm = () => {
    setSelectedTestResult(null);
    setTestResult({
      userTestId: '',
      correctAnswers: '',
      totalQuestions: '',
      totalTimeSeconds: '',
    });
    setIsModalOpen(false);
  };

  const columns = [
    {
      name: 'User Test ID',
      selector: (row) => row.user_test_id,
      sortable: true,
    },
    {
      name: 'Correct Answers',
      selector: (row) => row.correct_answers,
      sortable: true,
    },
    {
      name: 'Total Questions',
      selector: (row) => row.total_questions,
      sortable: true,
    },
    {
      name: 'Total Time (seconds)',
      selector: (row) => row.total_time_seconds,
      sortable: true,
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
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter User Test ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />
          <button className="btn btn-outline btn-primary" onClick={fetchTestResultById}>
            Search
          </button>
        </div>
        <div className="flex space-x-2">
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />
          <button className="btn btn-outline btn-primary" onClick={fetchTestResultsByDate}>
            Search by Date
          </button>
        </div>
      </div>
      <DataTable 
      columns={columns}
      data={testResults} 
      selectableRows
       pagination
        className="rounded-lg shadow-lg bg-white"
        title="Answer Result List"

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
              <label>Total Questions</label>
              <input
                type="number"
                value={testResult.totalQuestions}
                onChange={(e) => setTestResult({ ...testResult, totalQuestions: e.target.value })}
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
              <button className="btn" onClick={resetForm}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={() => {/* Add save logic here */}}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultManager;
