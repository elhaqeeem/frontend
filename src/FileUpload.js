import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(response.data.message);
      setFile(null); // Reset file input after upload
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.error || 'Failed to upload file.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <ToastContainer />
      <h2 className="text-lg font-bold mb-4">Upload File</h2>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Choose a file</span>
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          className="file-input file-input-bordered w-full mb-4"
        />
      </div>
      <button className="btn btn-primary" onClick={handleUpload}>
        Upload
      </button>
    </div>
  );
};

export default FileUpload;
