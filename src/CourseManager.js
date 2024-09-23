import React, { useEffect, useState, useRef } from 'react'; // Tambahkan useRef di sini
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
    harga: '', // Tambahkan harga di sini
    id: '',
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [permissions, setPermissions] = useState([]);// eslint-disable-next-line
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
      console.log('Courses fetched:', response.data); 
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

    const { title, description, harga, id } = courseData; // Ambil juga harga

    if (!title || !description || !harga) { // Validasi harga juga
      toast.error('Title, description, and price are required.');
      return;
    }


    const coursePayload = { title, description, harga: parseInt(harga) }; // Parse harga as integer

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
      console.log(`Create or update course: ${id ? 'Updating course' : 'Creating course'}`);
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

  const handleEdit = (course) => {
    console.log('Edit course:', course);
    if (!hasPermission('edit_course')) {
      toast.error('You do not have permission to edit courses.');
      return;
    }

    setCourseData({
      title: course.title,
      description: course.description,
      harga: course.harga, // Set harga di sini saat edit
      id: course.id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    console.log('Delete course with id:', id);
    if (!hasPermission('delete_course')) {
      toast.error('You do not have permission to delete courses.');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this course!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/courses/${id}`);
        toast.success('Course deleted successfully.');
        fetchCourses();
      } catch (error) {
        toast.error('Failed to delete course.');
      }
    }
  };

  const resetForm = () => {
    console.log('Reset form');
    setCourseData({ title: '', description: '', harga: '', id: '' }); // Reset harga juga
    setIsModalOpen(false);
  };

  const handleBulkDelete = async () => {
    console.log('Bulk delete selected courses:', selectedRows);
    if (selectedRows.length === 0) {
      toast.error('No courses selected for deletion.');
      return;
    }
  
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedRows.length} course(s)!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: 'No, cancel!',
    });
  
    if (result.isConfirmed) {
      try {
        // Send the selectedRows directly as an array, not wrapped in an object
        await axios.delete('/courses/bulk-delete', {
          data: selectedRows, // Change this line to directly use selectedRows
        });
        toast.success('Selected courses deleted successfully.');
        fetchCourses();
        setSelectedRows([]);
      } catch (error) {
        toast.error('Failed to delete selected courses.');
      }
    }
  };
  

  const columns = [
    {
      name: 'Select',
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.id)}
          onChange={() => {
            console.log(`Toggle selection for course id: ${row.id}`);
            setSelectedRows((prevSelected) => {
              if (prevSelected.includes(row.id)) {
                return prevSelected.filter((id) => id !== row.id);
              } else {
                return [...prevSelected, row.id];
              }
            });
          }}
        />
      ),
      width: '100px',
    },
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
      name: 'Price', // Tambahkan kolom harga
      selector: (row) => row.harga,
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          {hasPermission('edit_course') && (
            <button className="btn btn-outline btn-primary" onClick={() => handleEdit(row)}>
            <i className="fa fa-pencil" aria-hidden="true"></i>
            </button>
          )}
          {hasPermission('delete_course') && (
            <button className="btn btn-outline btn-error" onClick={() => handleDelete(row.id)}>
              <i className="fa fa-trash" aria-hidden="true"></i>

            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4 bg-white text-black">
      <div className="flex justify-between items-center mb-4">
        
        <button className="btn btn-outline btn-primary" onClick={() => {
          console.log('Open add course modal');
          setIsModalOpen(true);
        }}>
          Add Course
        </button>
        <button className="btn btn-outline btn-danger" onClick={handleBulkDelete}>
          Delete Selected
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

        onSelectedRowsChange={({ selectedRows }) => {
          console.log('Selected rows changed:', selectedRows.map(row => row.id));
          setSelectedRows(selectedRows.map(row => row.id));
        }}
      />
      <ToastContainer />
      {isModalOpen && (
        <div className="modal modal-open bg-dark text-black">
          <div className="modal-box max-w-lg mx-auto">
          <h2 className="font-bold text-lg">
        {courseData.id ? 'Edit Course' : 'Add Course'}
      </h2>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Title</span>
        </label>
        <input
          type="text"
          value={courseData.title}
          onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
          className="input input-bordered w-full mb-2"
          />
      </div>
      <div className="form-control mt-4">
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <ReactQuill
          ref={quillRef}
          value={courseData.description}
          onChange={(value) => setCourseData({ ...courseData, description: value })}
          className="mb-4"
          modules={modules} // Tambahkan modules untuk toolbar lengkap
      formats={formats} 
          />
      </div>
      <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Price</span>
              </label>
              <input
                type="number"
                value={courseData.harga}
                onChange={(e) => setCourseData({ ...courseData, harga: e.target.value })}
                className="input input-bordered w-full mb-2"
                />
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
