import React, { useEffect, useState, useMemo } from 'react';
import axios from './axiosInstance'; // Ensure the path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const TestAnswerManager = () => {
  const [testAnswers, setTestAnswers] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [userTestId, setUserTestId] = useState('');
  const [questionId, setQuestionId] = useState('');
  const [answer, setAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [answeredAt, setAnsweredAt] = useState(null);
  const [selectedTestAnswer, setSelectedTestAnswer] = useState(null);

  useEffect(() => {
    fetchTestAnswers();
  }, []);

  const fetchTestAnswers = async () => {
    try {
      const response = await axios.get('/test-answers');
      setTestAnswers(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch test answers.');
      console.error('Error fetching test answers:', error);
    }
  };

  const filteredTestAnswers = useMemo(() => {
    return testAnswers.filter((testAnswer) =>
      testAnswer.user_test_id.toString().includes(search) ||
      testAnswer.question_id.toString().includes(search)
    );
  }, [search, testAnswers]);

  const saveTestAnswer = async () => {
    if (!userTestId || !questionId || !answer || !answeredAt) {
      toast.error('All fields are required.');
      return;
    }

    const testAnswerData = {
      user_test_id: Number(userTestId),
      question_id: Number(questionId),
      answer,
      is_correct: isCorrect,
      answered_at: answeredAt.toISOString(),
    };

    try {
      if (selectedTestAnswer) {
        await axios.put(`/test-answers/${selectedTestAnswer.id}`, testAnswerData);
        toast.success('Test Answer updated successfully.');
      } else {
        await axios.post('/test-answers', testAnswerData);
        toast.success('Test Answer created successfully.');
      }
      fetchTestAnswers();
      resetForm();
    } catch (error) {
      toast.error('Failed to save test answer.');
      console.error('Error saving test answer:', error);
    }
  };

  const handleEdit = (testAnswer) => {
    setSelectedTestAnswer(testAnswer);
    setUserTestId(testAnswer.user_test_id);
    setQuestionId(testAnswer.question_id);
    setAnswer(testAnswer.answer);
    setIsCorrect(testAnswer.is_correct);
    setAnsweredAt(new Date(testAnswer.answered_at));
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this test answer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/test-answers/${id}`);
        toast.success('Test Answer deleted successfully.');
        fetchTestAnswers();
      } catch (error) {
        toast.error('Failed to delete test answer.');
        console.error('Error deleting test answer:', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one test answer to delete.');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedRows.length} test answer(s)!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete('/test-answers/bulk', {
          headers: {
            'Content-Type': 'application/json',
          },
          data: selectedRows.map(row => row.id), // Send array of IDs
        });
        toast.success('Selected test answers deleted successfully.');
        fetchTestAnswers(); // Refresh the list
      } catch (error) {
        toast.error('Failed to delete selected test answers.');
        console.error('Error bulk deleting test answers:', error);
      }
    }
  };

  const resetForm = () => {
    setSelectedTestAnswer(null);
    setUserTestId('');
    setQuestionId('');
    setAnswer('');
    setIsCorrect(false);
    setAnsweredAt(null);
    setIsModalOpen(false);
  };

  const columns = [
    {
      name: 'User Test ID',
      selector: (row) => row.user_test_id,
      sortable: true,
    },
    {
      name: 'Question ID',
      selector: (row) => row.question_id,
      sortable: true,
    },
    {
      name: 'Answer',
      selector: (row) => row.answer,
      sortable: true,
    },
    {
      name: 'Is Correct',
      selector: (row) => (row.is_correct ? 'Yes' : 'No'),
      sortable: true,
    },
    {
      name: 'Answered At',
      selector: (row) => row.answered_at,
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
        <button className="btn btn-outline btn-primary" onClick={() => setIsModalOpen(true)}>
          Add Test Answer
        </button>
        <button
          className="btn btn-outline btn-danger"
          onClick={handleBulkDelete}
          disabled={selectedRows.length === 0}
        >
          Delete Selected
        </button>
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full max-w-xs pl-10"
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={filteredTestAnswers}
        selectableRows
        onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
         pagination
        className="rounded-lg shadow-lg bg-white"
        title="Answer List"

      />

      {isModalOpen && (
        <div className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
          <div className="modal-box">
            <h2>{selectedTestAnswer ? 'Edit Test Answer' : 'Add Test Answer'}</h2>
            <input
              type="text"
              value={userTestId}
              onChange={(e) => setUserTestId(e.target.value)}
              placeholder="User Test ID"
              className="input input-bordered w-full mb-2"
            />
            <input
              type="text"
              value={questionId}
              onChange={(e) => setQuestionId(e.target.value)}
              placeholder="Question ID"
              className="input input-bordered w-full mb-2"
            />
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Answer"
              className="input input-bordered w-full mb-2"
            />
            <div className="form-control mb-2">
              <label className="label cursor-pointer">
                <span className="label-text">Is Correct</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={isCorrect}
                  onChange={(e) => setIsCorrect(e.target.checked)}
                />
              </label>
            </div>
            <DatePicker
              selected={answeredAt}
              onChange={(date) => setAnsweredAt(date)}
              showTimeSelect
              dateFormat="Pp"
              className="input input-bordered w-full mb-2"
              placeholderText="Answered At"
            />
            <div className="modal-action">
              <button className="btn btn-primary" onClick={saveTestAnswer}>
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

export default TestAnswerManager;
