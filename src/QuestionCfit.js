import React, { useEffect, useState, useMemo } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import 'react-quill/dist/quill.snow.css';
import Swal from 'sweetalert2';

const QuestionManagerCfit = () => {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false); // Bulk modal state
  const [questionText, setQuestionText] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState([]);
  const [answerOptions, setAnswerOptions] = useState([]); // Use consistent naming
  const [kraeplinTestId, setKraeplinTestId] = useState("");
  const [kraeplinTests, setKraeplinTests] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionId, setQuestionId] = useState('');
  const [bulkText, setBulkText] = useState(''); // Bulk text state
  const [selectedRows, setSelectedRows] = useState([]); // State for selected rows
  const token = localStorage.getItem("token"); // Ambil token dari localStorage

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    const fetchKraeplinTests = async () => {
      try {
        // Menggunakan Axios untuk melakukan request
        const response = await axios.get("/kraeplin-tests");
        
        // Periksa apakah data yang diterima adalah array
        if (Array.isArray(response.data)) {
          setKraeplinTests(response.data);
        } else {
          console.error("Data format is not an array:", response.data);
        }
      } catch (error) {
        console.error("Error fetching kraeplin tests:", error);
      }
    };

    if (token) {
      fetchKraeplinTests(); // Panggil fungsi fetch jika token ada
    } else {
      console.error("No authorization token found");
    }
  }, [token]);
  
  const fetchQuestions = async () => {
    try {
      const response = await axios.get('/questions');
      setQuestions(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch questions.');
      console.error('Error fetching questions:', error);
    }
  };

  const handleImageUpload = async (file, setImageState) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setImageState(response.data.url); // Assuming the API returns { url: 'image_url' }
      toast.success('Image uploaded successfully.');
    } catch (error) {
      toast.error('Failed to upload image.');
      console.error('Error uploading image:', error);
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) =>
      question.question_text.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, questions]);

  const saveQuestion = async () => {
    if (!kraeplinTestId || !questionText || correctAnswer === '') {
      toast.error('All fields are required.');
      return;
    }

    const questionData = {
      kraeplin_test_id: Number(kraeplinTestId), // Convert to number
      question_text: questionText,
      answer_options: answerOptions,
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
    setAnswerOptions(question.answer_options);
    setCorrectAnswer(question.correct_answer);
    setIsModalOpen(true);
  };

  const addAnswerOption = () => {
    setAnswerOptions([...answerOptions, '']);
  };

  const addCorrectAnswerOption = () => {
    setCorrectAnswer([...correctAnswer, '']);
  };

  const updateAnswerOption = (index, value) => {
    const newOptions = [...answerOptions];
    newOptions[index] = value;
    setAnswerOptions(newOptions);
  };

  const updateCorectAnswerOption = (index, value) => {
    const newOptions = [...correctAnswer];
    newOptions[index] = value;
    setCorrectAnswer(newOptions);
  };

  const removeAnswerOption = (index) => {
    const newOptions = answerOptions.filter((_, i) => i !== index);
    setAnswerOptions(newOptions);
  };

  const removeCorrectAnswerOption = (index) => {
    const newOptions = correctAnswer.filter((_, i) => i !== index);
    setCorrectAnswer(newOptions);
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
    setCorrectAnswer([]); // Reset to empty string
    setQuestionId('');
    setAnswerOptions([]);
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
        answer_options: parts[2].split('|').map((option) => option.trim()),
        correct_answer: parts[3].split('|').map((option) => option.trim()),
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
      name: 'Id',
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: 'Test ID',
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
      name: 'Answer Options',
      selector: (row) => Array.isArray(row.answer_options) ? row.answer_options.join(', ') : row.answer_options,
      sortable: true,
    },
    {
      name: 'Correct Answer',
      selector: (row) => Array.isArray(row.correct_answer) ? row.correct_answer.join(', ') : row.correct_answer,
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
        columns={columns}
        data={filteredQuestions}
        selectableRows
        onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
        pagination
        className="rounded-lg shadow-lg bg-white"
        title="Question Test List"
      />
      
      {/* Modal for Add/Edit Question */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
          <div className="form-control">
      <label className="label">
        <span className="label-text">Kraeplin Test</span>
      </label>
      <select
        value={kraeplinTestId}
        onChange={(e) => setKraeplinTestId(e.target.value)}
        className="select select-bordered"
      >
        <option value="" disabled>
          Select a test
        </option>
        {Array.isArray(kraeplinTests) && kraeplinTests.length > 0 ? (
          kraeplinTests.map((test) => (
            <option key={test.id} value={test.id}>
              {test.description}
            </option>
          ))
        ) : (
          <option disabled>No tests available</option>
        )}
      </select>
    </div>
            <div className="form-control">
              <label className="label">Question Image</label>
              <input
                type="file"
                onChange={(e) => handleImageUpload(e.target.files[0], setQuestionText)}
                className="file-input file-input-bordered"
              />
              {questionText && <img src={questionText} alt="Preview" className="mt-2 w-32 h-32" />}
            </div>
            <div className="form-control">
              <label className="label">Answer Options</label>
              {answerOptions.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="file"
                    onChange={(e) => handleImageUpload(e.target.files[0], (url) => updateAnswerOption(index, url))}
                    className="file-input file-input-bordered"
                  />
                  {option && <img src={option} alt="Option" className="w-16 h-16" />}
                  <button className="btn btn-error" onClick={() => removeAnswerOption(index)}>Remove</button>
                </div>
              ))}
              <button className="btn btn-primary" onClick={addAnswerOption}>Add Option</button>
            </div>
            <div className="form-control">
  <label className="label">
    <span className="label-text">Correct Answer Options</span>
  </label>
  {correctAnswer.map((option, index) => (
    <div key={index} className="flex items-center space-x-2 mb-2">
      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          handleImageUpload(e.target.files[0], (url) => updateCorectAnswerOption(index, url))
        }
        className="file-input file-input-bordered"
      />
      {option && <img src={option} alt="Correct Option" className="w-16 h-16" />}
      <button
        className="btn btn-error"
        onClick={() => removeCorrectAnswerOption(index)}
      >
        Remove
      </button>
    </div>
  ))}
  <button className="btn btn-primary" onClick={addCorrectAnswerOption}>
    Add Correct Answer Option
  </button>
</div>

            <div className="modal-action">
              <button className="btn" onClick={resetForm}>Cancel</button>
              <button className="btn btn-primary" onClick={saveQuestion}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Bulk Import */}
      {isBulkModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="text-xl text-gray">Bulk Import Questions</h2>
            <br></br>
            <textarea
              value={bulkText}
              onChange={handleBulkTextChange}
              className="textarea textarea-bordered w-full h-32 text-black"
              placeholder="Format ID,Question,OptionAnswer|OptionAnwer|OptionAnswe,Answer Example 6,Where Agnes live ?,Dubai|Bali|Bandung,Bandung"
            />
            <div className="modal-action">
              <button className="btn" onClick={() => setIsBulkModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleBulkImport}>Import</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManagerCfit;
