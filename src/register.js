import React, { useState } from 'react';
import axios from './axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    picture: {
      String: '',
      Valid: true,
    },
  });

  const [step, setStep] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // Untuk pratinjau gambar
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file)); // Buat URL untuk pratinjau gambar
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast.error('Please select an image file.');
      return;
    }

    setIsUploading(true); // Tampilkan loader saat upload
    const uploadData = new FormData();
    uploadData.append('file', imageFile);

    try {
      const response = await axios.post('/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const imageUrl = response.data.url;
      setFormData((prevData) => ({
        ...prevData,
        picture: { String: imageUrl, Valid: true },
      }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image.');
    } finally {
      setIsUploading(false); // Sembunyikan loader setelah upload selesai
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      ...formData,
      role_id: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const response = await axios.post('/users', userData);
      toast.success('User registered successfully!');
      navigate('/login');
    } catch (error) {
      console.error('Error registering user:', error);
      toast.error('Failed to register user.');
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="flex justify-center items-center min-h-screen bg-lemonade">
      <ToastContainer />
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="text-center text-2xl font-bold">Register</h2>

          {/* Progress bar */}
          <ul className="steps w-full">
            <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Account Info</li>
            <li className={`step ${step >= 2 ? 'step-primary' : ''}`}>Personal Info</li>
            <li className={`step ${step >= 3 ? 'step-primary' : ''}`}>Profile Picture</li>
          </ul>

          <form onSubmit={handleSubmit}>
            {/* Step 1 */}
            {step === 1 && (
              <>
                <div className="form-control mt-4">
                  <label className="label">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="modal-action">
                  <button type="button" onClick={nextStep} className="btn btn-secondary">
                    Next
                  </button>
                </div>
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                <div className="form-control mt-4">
                  <label className="label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="modal-action">
                  <button type="button" onClick={prevStep} className="btn btn-secondary">
                    Previous
                  </button>
                  <button type="button" onClick={nextStep} className="btn btn-primary">
                    Next
                  </button>
                </div>
              </>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <>
                <div className="form-control mt-4">
                  <label className="label">Upload Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input file-input-bordered"
                    required
                  />
                </div>
                {previewUrl && (
                  <div className="mt-4">
                    <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover mx-auto rounded-full" />
                  </div>
                )}
                <div className="form-control mt-2">
                  <button type="button" onClick={handleImageUpload} className="btn btn-info">
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
                <div className="modal-action">
                  <button type="button" onClick={prevStep} className="btn btn-secondary">
                    Previous
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
