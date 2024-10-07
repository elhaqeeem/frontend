import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; // Make sure this is your configured Axios instance
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';

const ImageManager = () => {
  const [images, setImages] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    setFilteredImages(
      images.filter((image) =>
        image.public_id.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, images]);

  const fetchImages = async () => {
    try {
      const response = await axios.get('/assets'); // Assuming you have an endpoint that lists all assets
      setImages(response.data.assets || []);
    } catch (error) {
      toast.error('Failed to fetch images.');
    }
  };

  const handleViewInfo = async (publicID) => {
    try {
      const response = await axios.get(`/asset/${publicID}`);
      setSelectedImage(response.data.asset);
      toast.success('Asset info loaded.');
    } catch (error) {
      toast.error('Failed to load asset info.');
    }
  };

  const handleUpdateTags = async (publicID, tags) => {
    try {// eslint-disable-next-line
      const response = await axios.put(`/asset/${publicID}`, { tags });
      toast.success('Tags updated successfully.');
      fetchImages();
    } catch (error) {
      toast.error('Failed to update tags.');
    }
  };

  const handleDeleteAsset = async (publicID) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this asset!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/asset/${publicID}`);
        toast.success('Asset deleted successfully.');
        fetchImages();
      } catch (error) {
        toast.error('Failed to delete asset.');
      }
    }
  };

  const handleTransformImage = async (publicID) => {
    try {
      const response = await axios.get(`/transform/${publicID}`);
      toast.success('Image transformed successfully.');
      window.open(response.data.url, '_blank'); // Opens the transformed image in a new tab
    } catch (error) {
      toast.error('Failed to transform image.');
    }
  };

  const columns = [
    {
      name: 'Public ID',
      selector: (row) => row.public_id,
      sortable: true,
    },
    {
      name: 'Width',
      selector: (row) => row.width,
      sortable: true,
    },
    {
      name: 'Height',
      selector: (row) => row.height,
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            className="btn btn-outline btn-primary"
            onClick={() => handleViewInfo(row.public_id)}
          >
            Info
          </button>
          <button
            className="btn btn-outline btn-success"
            onClick={() => handleTransformImage(row.public_id)}
          >
            Transform
          </button>
          <button
            className="btn btn-outline btn-danger"
            onClick={() => handleDeleteAsset(row.public_id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4 bg-white text-black">
      <ToastContainer position="top-right" />
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search images..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full max-w-xs pl-10"
          />
          <i className="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      <DataTable
        title="Image List"
        columns={columns}
        data={filteredImages}
        noDataComponent="No images available"
        pagination
        className="rounded-lg shadow-lg bg-white"
      />

      {selectedImage && (
        <div className="modal modal-open bg-dark text-black">
          <div className="modal-box max-w-lg mx-auto">
            <h2 className="font-bold text-lg">Asset Info</h2>
            <p><strong>Public ID:</strong> {selectedImage.public_id}</p>
            <p><strong>Width:</strong> {selectedImage.width}</p>
            <p><strong>Height:</strong> {selectedImage.height}</p>
            <input
              type="text"
              placeholder="Update Tags"
              onChange={(e) => handleUpdateTags(selectedImage.public_id, e.target.value)}
              className="input input-bordered w-full mb-2"
            />
            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedImage(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageManager;