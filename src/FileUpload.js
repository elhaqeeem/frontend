import React, { useState, useEffect } from 'react';
import { Dropbox } from 'dropbox';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DropboxFileUpload = () => {
  const [file, setFile] = useState(null);
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    // Check if there's an access token in the URL after authentication
    const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
    const token = hashParams.get('access_token');
    if (token) {
      setAccessToken(token);
      toast.success('Dropbox login successful!');
    }
  }, []);

  const authenticateDropbox = () => {
    const CLIENT_ID = 'YOUR_DROPBOX_APP_KEY'; // Replace with your Dropbox App Key
    const redirectUri = 'http://localhost:3000'; // Your redirect URI
    const authUrl = `https://www.dropbox.com/oauth2/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${redirectUri}`;

    // Redirect user to Dropbox authorization page
    window.location.href = authUrl;
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    if (!accessToken) {
      toast.error('Please login to Dropbox first.');
      return;
    }

    const dbx = new Dropbox({ accessToken });

    try {
      const response = await dbx.filesUpload({
        path: '/' + file.name, // Upload to Dropbox root folder
        contents: file,
      });
      toast.success(`File "${file.name}" uploaded successfully!`);
      setFile(null);
    } catch (error) {
      toast.error('Failed to upload file to Dropbox.');
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <ToastContainer />
      <h2 className="text-lg font-bold mb-4">Upload File to Dropbox</h2>

      {!accessToken && (
        <button className="btn btn-primary mb-4" onClick={authenticateDropbox}>
          Login with Dropbox
        </button>
      )}

      {accessToken && (
        <>
          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Choose a file</span>
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="file-input file-input-bordered w-full mb-4"
            />
          </div>
          <button className="btn btn-primary" onClick={uploadFile}>
            Upload
          </button>
        </>
      )}
    </div>
  );
};

export default DropboxFileUpload;
