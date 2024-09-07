import React, { useEffect, useState, useMemo } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Swal from 'sweetalert2';

const QuestionManager = () => {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false); // Bulk modal state
  const [questionText, setQuestionText] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [kraeplinTestId, setKraeplinTestId] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionId, setQuestionId] = useState('');
  const [bulkText, setBulkText] = useState(''); // Bulk text state
  const [selectedRows, setSelectedRows] = useState([]); // State for selected rows

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('/questions');
      setQuestions(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch questions.');
      console.error('Error fetching questions:', error);
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) =>
      question.question_text.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, questions]);

  const saveQuestion = async () => {
    if (!kraeplinTestId || !questionText || correctAnswer === null) {
      toast.error('All fields are required.');
      return;
    }

    const questionData = {
      kraeplin_test_id: Number(kraeplinTestId), // Convert to number
      question_text: questionText,
      correct_answer: correctAnswer,
    };

    try {
      if (selectedQuestion) {
        const result = await Swal.fire({
          title: 'Are you sure?',
          text: 'You are about to update this question!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, update it!',
          cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
          await axios.put(`/questions/${questionId}`, questionData);
          toast.success('Question updated successfully.');
        }
      } else {
        await axios.post('/questions', questionData);
        toast.success('Question created successfully.');
      }
      fetchQuestions();
      resetForm();
    } catch (error) {
      toast.error('Failed to save question.');
      console.error('Error saving question:', error);
    }
  };

  const handleEdit = (question) => {
    setSelectedQuestion(question);
    setQuestionId(question.id);
    setKraeplinTestId(question.kraeplin_test_id);
    setQuestionText(question.question_text);
    setCorrectAnswer(question.correct_answer);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this question!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/questions/${id}`);
        toast.success('Question deleted successfully.');
        fetchQuestions();
      } catch (error) {
        toast.error('Failed to delete question.');
        console.error('Error deleting question:', error);
      }
    }
  };

  const resetForm = () => {
    setSelectedQuestion(null);
    setKraeplinTestId('');
    setQuestionText('');
    setCorrectAnswer(null); // Reset to null
    setQuestionId('');
    setIsModalOpen(false);
  };

  const handleBulkTextChange = (e) => {
    setBulkText(e.target.value);
  };

  const handleBulkImport = async () => {
    if (!bulkText) {
      toast.error('Please enter text to import.');
      return;
    }
  
    const textArray = bulkText.split('\n').filter((line) => line.trim());
    const questionsArray = textArray.map((line) => {
      const parts = line.split(',').map((part) => part.trim());
      return {
        kraeplin_test_id: Number(parts[0]), // Convert to number
        question_text: parts[1],
        correct_answer: Number(parts[2]),
      };
    });
  
    try {
      await axios.post('/questions/bulk-import-text', { questions: questionsArray });
      toast.success('Questions imported successfully from text.');
      fetchQuestions(); 
      setIsBulkModalOpen(false); // Close modal after import
    } catch (error) {
      toast.error('Failed to import questions from text.');
      console.error('Error importing text questions:', error);
    }
  };

  // Bulk delete handler
  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one question to delete.');
      return;
    }
  
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedRows.length} question(s)!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: 'No, cancel!',
    });
  
    if (result.isConfirmed) {
      try {
        // Log the IDs being sent for deletion
        console.log('Deleting IDs:', selectedRows.map(row => row.id));
        
        await axios.delete('/questions/bulk', {
          data: { ids: selectedRows.map(row => row.id) },
        });
        toast.success('Selected questions deleted successfully.');
        fetchQuestions(); // Refresh the data
      } catch (error) {
        toast.error('Failed to delete selected questions.');
        console.error('Error bulk deleting questions:', error);
      }
    }
  };
  

  const columns = [
    {
      name: 'Kraeplin Test ID',
      selector: (row) => row.kraeplin_test_id,
      sortable: true,
    },
    {
      name: 'Question Text',
      selector: (row) => row.question_text,
      sortable: true,
      cell: (row) => <div dangerouslySetInnerHTML={{ __html: row.question_text }} />,
    },
    {
      name: 'Correct Answer',
      selector: (row) => row.correct_answer,
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
    <div className="container mx-auto p-4 bg-white text-black">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <button className="btn btn-outline btn-primary" onClick={() => setIsModalOpen(true)}>
          Add Question
        </button>
        <button className="btn btn-outline btn-success" onClick={() => setIsBulkModalOpen(true)}>
          Bulk Question
        </button>
        <button
          className="btn btn-outline btn-danger"
          onClick={handleBulkDelete}
          disabled={selectedRows.length === 0} // Disable button if no row is selected
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
          <i className="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      <DataTable
        title="Question List"
        columns={columns}
        data={filteredQuestions}
        selectableRows // Enable row selection
        onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)} // Update selected rows
        noDataComponent="No questions available"
        pagination
        className="rounded-lg shadow-lg bg-white"
      />

      {/* Modal for Adding/Editing a Question */}
      {isModalOpen && (
        <div className="modal modal-open bg-dark text-white">
          <div className="modal-box max-w-lg mx-auto">
            <h2 className="font-bold text-lg">{selectedQuestion ? 'Edit Question' : 'Add Question'}</h2>
            <div className="form-group">
              <label className="block mb-2">Kraeplin Test ID</label>
              <input
                type="number"
                value={kraeplinTestId}
                onChange={(e) => setKraeplinTestId(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-group">
              <label className="block mb-2">Question Text</label>
              <ReactQuill value={questionText} onChange={setQuestionText} className="h-42" />
            </div>
            <div className="form-group">
              <label className="block mb-2">Correct Answer</label>
              <input
                type="number"
                value={correctAnswer || ''} // Convert null to an empty string
                onChange={(e) => setCorrectAnswer(e.target.value ? Number(e.target.value) : null)}
                className="input input-bordered w-full"
              />
            </div>
            <div className="modal-action">
              <button className="btn btn-success" onClick={saveQuestion}>
                Save
              </button>
              <button className="btn btn-danger" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Bulk Import */}
      {isBulkModalOpen && (
        <div className="modal modal-open bg-dark text-white">
          <div className="modal-box max-w-lg mx-auto">
            <h2 className="font-bold text-lg">Bulk Import Questions</h2>
            <textarea
              value={bulkText}
              onChange={handleBulkTextChange}
              className="textarea textarea-bordered w-full h-32"
              placeholder="Enter bulk text in the format: kraeplin_test_id, question_text, correct_answer"
            ></textarea>
            <div className="modal-action">
              <button className="btn btn-success" onClick={handleBulkImport}>
                Import
              </button>
              <button className="btn btn-danger" onClick={() => setIsBulkModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManager;
