import React, { useEffect, useState, useMemo } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';

const KraeplinTestResultManager = () => {
  const [sequenceNumber, setSequenceNumber] = useState('');
  const [columnNumber, setColumnNumber] = useState('');
  const [waktu, setWaktu] = useState('');
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false); // Bulk modal state
  const [deretAngka, setDeretAngka] = useState([]); // Already correct
  const [kraeplinTestId, setKraeplinTestId] = useState('');
  const [kraeplinTests, setKraeplinTests] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [resultId, setResultId] = useState('');
  const [bulkText, setBulkText] = useState(''); // Bulk text state
  const [selectedRows, setSelectedRows] = useState([]); // State for selected rows
  const token = localStorage.getItem("token"); // Ambil token dari localStorage

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    const fetchKraeplinTests = async () => {
      try {
        const response = await fetch("/kraeplin-tests", {
          headers: {
            Authorization: `Bearer ${token}`, // Tambahkan Authorization header
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          console.error("Authorization header required");
          return;
        }

        const data = await response.json();

        // Pastikan data yang diterima adalah array
        if (Array.isArray(data)) {
          setKraeplinTests(data);
        } else {
          console.error("Data format is not an array:", data);
        }
      } catch (error) {
        console.error("Error fetching kraeplin tests:", error);
      }
    };

    if (token) {
      fetchKraeplinTests(); // Panggil fetch jika token ada
    } else {
      console.error("No authorization token found");
    }
  }, [token]);


  const addAnswerOption = () => {
    setDeretAngka([...deretAngka, '']);
  };

  const removeAnswerOption = (index) => {
    const newOptions = deretAngka.filter((_, i) => i !== index);
    setDeretAngka(newOptions);
  };

  const updateAnswerOption = (index, value) => {
    const newOptions = [...deretAngka];
    newOptions[index] = value;
    setDeretAngka(newOptions);
  };


  const fetchResults = async () => {
    try {
      const response = await axios.get('/kraeplin-test-result');
      setResults(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch Kraeplin test results.');
      console.error('Error fetching results:', error);
    }
  };

  const filteredResults = useMemo(() => {
    return results.filter((result) =>
      result.deret_angka.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, results]);

  const saveResult = async () => {
    if (!kraeplinTestId || !deretAngka.length || !sequenceNumber || !columnNumber || !waktu) {
      toast.error('All fields are required.');
      return;
    }

    const resultData = {
      id: resultId,  // Include the ID in the body
      kraeplin_test_id: Number(kraeplinTestId),
      sequence_number: Number(sequenceNumber),
      deret_angka: JSON.stringify(deretAngka),  // Converts array to string like "[1, 2, 3, 4]"
      column_number: Number(columnNumber),
      waktu: Number(waktu),
    };



    try {
      if (selectedResult) {
        const result = await Swal.fire({
          title: 'Are you sure?',
          text: 'You are about to update this result!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, update it!',
          cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
          await axios.put(`/kraeplin-test-result/${resultId}`, resultData);
          toast.success('Result updated successfully.');
        }
      } else {
        await axios.post('/kraeplin-test-result', resultData);
        toast.success('Result created successfully.');
      }
      fetchResults();
      resetForm();
    } catch (error) {
      toast.error('Failed to save result.');
      console.error('Error saving result:', error);
    }
  };


  const handleEdit = (result) => {
    setSelectedResult(result);
    setResultId(result.id);
    setKraeplinTestId(result.kraeplin_test_id);
    // Ensure deret_angka is treated as an array
    setDeretAngka(Array.isArray(result.deret_angka) ? result.deret_angka : JSON.parse(result.deret_angka));
    setColumnNumber(result.column_number);
    setSequenceNumber(result.sequence_number);
    setWaktu(result.waktu);

    setIsModalOpen(true);
  };


  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this result!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/kraeplin-test-result/${id}`);
        toast.success('Result deleted successfully.');
        fetchResults();
      } catch (error) {
        toast.error('Failed to delete result.');
        console.error('Error deleting result:', error);
      }
    }
  };

  const resetForm = () => {
    setSelectedResult(null);
    setKraeplinTestId('');
    setSequenceNumber('');
    setColumnNumber('');
    setWaktu('');
    setDeretAngka([]);  // Ensure this is reset to an empty array, not an empty string
    setResultId('');
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

    const textArray = bulkText.split('\n').filter((line) => line.trim()); // Split by line

    const resultsArray = textArray.map((line) => {
      const parts = line.split(',').map((part) => part.trim()); // Split each line by commas and trim spaces

      // Convert deret_angka from a space-separated string into an array of numbers
      const deretAngkaArray = parts[2].split(' ').map(Number).filter(n => !isNaN(n)); // Remove invalid numbers (NaN)

      return {
        kraeplin_test_id: Number(parts[0]),  // kraeplin_test_id as a number
        sequence_number: Number(parts[1]),   // sequence_number as a number
        deret_angka: JSON.stringify(deretAngkaArray), // Convert array to valid JSON format
        column_number: Number(parts[3]),     // column_number as a number
        waktu: parts[4] ? Number(parts[4]) : null, // waktu as a number (nullable)
        created_at: new Date().toISOString() // Automatically add current timestamp
      };
    });

    // Filter out any undefined or empty lines
    const validResultsArray = resultsArray.filter((item) => item !== undefined && item !== null);

    if (validResultsArray.length === 0) {
      toast.error('No valid data to import.');
      return;
    }

    try {
      // Simulating an API post request with axios (replace with actual endpoint)
      await axios.post('/kraeplin-test-result/bulk', validResultsArray);
      toast.success('Results imported successfully from text.');
      fetchResults();  // Assuming this function fetches the updated results
      setIsBulkModalOpen(false);  // Close modal after import
    } catch (error) {
      toast.error('Failed to import results from text.');
      console.error('Error importing text results:', error);
    }
  };




  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one result to delete.');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedRows.length} result(s)!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete('/kraeplin-test-result/bulk', {
          data: { ids: selectedRows.map(row => row.id) },
        });
        toast.success('Selected results deleted successfully.');
        fetchResults(); // Refresh the data
      } catch (error) {
        toast.error('Failed to delete selected results.');
        console.error('Error bulk deleting results:', error);
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
      name: 'Deret Angka',
      selector: (row) => Array.isArray(row.deret_angka) ? row.deret_angka.join(', ') : row.deret_angka,
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
          Add Result
        </button>
        <button className="btn btn-outline btn-success" onClick={() => setIsBulkModalOpen(true)}>
          Bulk Result
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
            className="input input-bordered input-sm w-full"
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={filteredResults}
        pagination
        selectableRows
        onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
      />
      {/* Modal for creating/editing result */}
      {isModalOpen && (  <div className="modal modal-open">
      <div className="modal-box">
      <h2 className="text-xl font-bold mb-4">Kraepelin Test Result</h2>

          {/* Select untuk Kraeplin Test */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Kraepelin Test</span>
            </label>
            <select
              value={kraeplinTestId}
              onChange={(e) => setKraeplinTestId(e.target.value)}
              className="select select-bordered"
            >
              <option value="" disabled>Select a test</option>
              {kraeplinTests?.length > 0 ? (
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

          {/* Input untuk Deret Angka */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Deret Angka</span>
            </label>
            {deretAngka.map((option, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateAnswerOption(index, e.target.value)}
                  className="input input-bordered flex-grow"
                />
                <button
                  className="btn btn-outline btn-error"
                  onClick={() => removeAnswerOption(index)}
                >
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            ))}
            <button className="btn btn-rounded btn-primary" onClick={addAnswerOption}>
              Add Deret Angka Option
            </button>
          </div>

          {/* Input untuk Sequence Number */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Sequence Number</span>
            </label>
            <input
              type="number"
              value={sequenceNumber}
              onChange={(e) => setSequenceNumber(e.target.value)}
              className="input input-bordered"
              placeholder="Enter sequence number"
            />
          </div>

          {/* Input untuk Column Number */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Column Number</span>
            </label>
            <input
              type="number"
              value={columnNumber}
              onChange={(e) => setColumnNumber(e.target.value)}
              className="input input-bordered"
              placeholder="Enter column number"
            />
          </div>

          {/* Input untuk Waktu */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Waktu</span>
            </label>
            <input
              type="number"
              value={waktu}
              onChange={(e) => setWaktu(e.target.value)}
              className="input input-bordered"
              placeholder="Enter waktu (in minutes)"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="modal-action">
            <button className="btn btn-outline btn-secondary" onClick={resetForm}>
              Cancel
            </button>
            <button className="btn btn-outline btn-primary" onClick={saveResult}>
              {selectedResult ? 'Update Result' : 'Save Result'}
            </button>
          </div>
        </div>
      </div>  )}
     

      {/* Bulk Import Modal */}
      <div className={`modal ${isBulkModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h2 className="text-xl font-bold mb-4">Bulk Import Results</h2>
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Enter results (e.g., test_id, deret_angka)"
            value={bulkText}
            onChange={handleBulkTextChange}
          ></textarea>
          <div className="flex justify-end space-x-2 mt-4">
            <button className="btn btn-outline btn-secondary" onClick={() => setIsBulkModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-outline btn-primary" onClick={handleBulkImport}>
              Import Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KraeplinTestResultManager;
