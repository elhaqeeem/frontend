import React, { useEffect, useState, useRef } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill'; // Import ReactQuill
import 'react-quill/dist/quill.snow.css'; // Import Quill stylesheet

const CourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    harga: '',
    path_image: '', // Tambahkan path_image di sini
    id: '',
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [userId, setUserId] = useState(null);
  const quillRef = useRef(null);

  const modules = {
    toolbar: [
      [{ header: '1' }, { header: '2' }, { font: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      ['blockquote', 'code-block'],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['clean'], // clear formatting
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'script', 'align',
  ];

  useEffect(() => {
    const storedUserId = localStorage.getItem('id');
    setUserId(storedUserId);
    fetchCourses();
    if (storedUserId) {
      fetchPermissions(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (Array.isArray(courses)) {
      setFilteredCourses(
        courses.filter((course) =>
          course.title.toLowerCase().includes(search.toLowerCase()) ||
          course.description.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, courses]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/courses');
      setCourses(response.data.courses || []);
    } catch (error) {
      toast.error('Failed to fetch courses.');
    }
  };

  const fetchPermissions = async (userId) => {
    try {
      const response = await axios.get(`/roles/${userId}/permissions`);
      setPermissions(response.data.permissions || []);
    } catch (error) {
      toast.error('Failed to fetch user permissions.');
    }
  };

  const hasPermission = (permissionName) => {
    return permissions.some((permission) => permission.permission_name === permissionName);
  };

  const handleCreateOrUpdate = async () => {
    if (!hasPermission('create_course') && !hasPermission('edit_course')) {
      toast.error('You do not have permission to create or update courses.');
      return;
    }

    const { title, description, harga, path_image, id } = courseData;

    if (!title || !description || !harga || !path_image) {
      toast.error('All fields are required, including image.');
      return;
    }

    const coursePayload = {
      title,
      description,
      harga: parseInt(harga),
      path_image, // Sertakan path_image di payload
    };

    const confirmationText = id ? 'update this course!' : 'create a new course!';
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to ${confirmationText}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      try {
        id
          ? await axios.put(`/courses/${id}`, coursePayload)
          : await axios.post('/courses', coursePayload);

        toast.success(`Course ${id ? 'updated' : 'created'} successfully.`);
        fetchCourses();
        resetForm();
      } catch (error) {
        toast.error(`Failed to ${id ? 'update' : 'create'} course.`);
      }
    }
  };

    const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setCourseData({ ...courseData, path_image: response.data.url });
      toast.success('Image uploaded successfully.');
    } catch (error) {
      toast.error('Failed to upload image.');
    }
  };

  const handleEdit = (course) => {
    if (!hasPermission('edit_course')) {
      toast.error('You do not have permission to edit courses.');
      return;
    }

    setCourseData({
      title: course.title,
      description: course.description,
      harga: course.harga,
      path_image: course.path_image, // Set path_image saat edit
      id: course.id,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setCourseData({
      title: '',
      description: '',
      harga: '',
      path_image: '', // Reset path_image
      id: '',
    });
    setIsModalOpen(false);
  };

  const columns = [
    {
      name: 'Title',
      selector: (row) => row.title,
      sortable: true,
    },
    {
      name: 'Description',
      selector: (row) => row.description,
      sortable: true,
    },
    {
      name: 'Price',
      selector: (row) => row.harga,
      sortable: true,
    },
    {
      name: 'Image',
      selector: (row) => row.path_image,
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          {hasPermission('edit_course') && (
            <button className="btn btn-outline btn-primary" onClick={() => handleEdit(row)}>
              Edit
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4 bg-white text-black">
      <div className="flex justify-between items-center mb-4">
        <button className="btn btn-outline btn-primary" onClick={() => setIsModalOpen(true)}>
          Add Course
        </button>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered w-full max-w-xs pl-10"
        />
      </div>
      <DataTable
        title="Course List"
        columns={columns}
        data={filteredCourses}
        pagination
        selectableRows
        className="rounded-lg shadow-lg bg-white"
      />
      <ToastContainer />
      {isModalOpen && (
        <div className="modal modal-open bg-dark text-black">
          <div className="modal-box max-w-lg mx-auto">
            <h2 className="font-bold text-lg">{courseData.id ? 'Edit Course' : 'Add Course'}</h2>
            <div className="form-control">
              <label className="label">Title</label>
              <input
                type="text"
                value={courseData.title}
                onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                className="input input-bordered w-full mb-2"
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">Description</label>
              <ReactQuill
                ref={quillRef}
                value={courseData.description}
                onChange={(value) => setCourseData({ ...courseData, description: value })}
                className="mb-4"
                modules={modules}
                formats={formats}
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">Price</label>
              <input
                type="number"
                value={courseData.harga}
                onChange={(e) => setCourseData({ ...courseData, harga: e.target.value })}
                className="input input-bordered w-full mb-2"
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">Upload Image</label>
              <input type="file" onChange={handleImageUpload} className="file-input w-full" />
            </div>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={handleCreateOrUpdate}>
                {courseData.id ? 'Update' : 'Create'}
              </button>
              <button className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManager;
