import React, { useEffect, useState, useMemo } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const UserTestManager = () => {
  const [userTests, setUserTests] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [userId, setUserId] = useState('');
  const [kraeplinTestId, setKraeplinTestId] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [users, setUsers] = useState([]);
  const [kraeplinTests, setKraeplinTests] = useState([]);
  const token = localStorage.getItem("token"); // Ambil token dari localStorage

  useEffect(() => {
    fetchUserTests();
    fetchUsers();
    fetchKraeplinTests();// eslint-disable-next-line
  }, []);

  const fetchUserTests = async () => {
    try {
      const response = await axios.get('/user-tests');
      setUserTests(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch user tests.');
      console.error('Error fetching user tests:', error);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('token'); // Get the token from local storage
    try {
      const response = await axios.get('/users', {
        headers: { Authorization: `Bearer ${token}` }, // Add Authorization header
      });
      setUsers(response.data || []); // Update users state
    } catch (error) {
      toast.error('Failed to fetch users.');
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

 
useEffect(() => {
  const fetchKraeplinTests = async () => {
    try {
      const response = await axios.get("/kraeplin-tests", {
        headers: {
          Authorization: `Bearer ${token}`, // Tambahkan Authorization header
          "Content-Type": "application/json",
        },
      });

      // Pastikan data yang diterima adalah array
      if (Array.isArray(response.data)) {
        setKraeplinTests(response.data);
      } else {
        console.error("Data format is not an array:", response.data);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error("Authorization header required");
      } else {
        console.error("Error fetching kraeplin tests:", error);
      }
    }
  };

  if (token) {
    fetchKraeplinTests(); // Panggil fetch jika token ada
  } else {
    console.error("No authorization token found");
  }
}, [token]);


// Tambahkan handleBulkDelete sebelum return
const handleBulkDelete = async () => {
  if (selectedRows.length === 0) {
    toast.error('Please select at least one user test to delete.');
    return;
  }

  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete ${selectedRows.length} user test(s)!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete them!',
    cancelButtonText: 'No, cancel!',
  });

  if (result.isConfirmed) {
    try {
      await axios.delete('/user-tests/bulk', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Add Authorization header
        },
        data: selectedRows.map(row => row.id),
      });
      toast.success('Selected user tests deleted successfully.');
      fetchUserTests();
    } catch (error) {
      toast.error('Failed to delete selected user tests.');
      console.error('Error bulk deleting user tests:', error);
    }
  }
};

const columns = [
  {
    name: 'ID',
    selector: (row) => row.id,
    sortable: true,
  },
  {
    name: 'User ID',
    selector: (row) => row.user_id,
    sortable: true,
  },
  {
    name: 'Kraeplin Test ID',
    selector: (row) => row.kraeplin_test_id,
    sortable: true,
  },
  {
    name: 'Start Time',
    selector: (row) => new Date(row.start_time).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    sortable: true,
  },
  {
    name: 'End Time',
    selector: (row) => new Date(row.end_time).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
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
const filteredUserTests = useMemo(() => {
  return userTests.filter((test) =>
    test.user_id.toString().includes(search) ||
    test.kraeplin_test_id.toString().includes(search)
  );
}, [search, userTests]);
const saveUserTest = async () => {
  if (!userId || !kraeplinTestId || !startTime || !endTime) {
    toast.error('All fields are required.');
    return;
  }

  const userTestData = {
    user_id: Number(userId),
    kraeplin_test_id: Number(kraeplinTestId),
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
  };

  try {
    if (selectedTest) {
      await axios.put(`/user-tests/${selectedTest.id}`, userTestData);
      toast.success('User Test updated successfully.');
    } else {
      await axios.post('/user-tests', userTestData);
      toast.success('User Test created successfully.');
    }
    fetchUserTests();
    resetForm();
  } catch (error) {
    toast.error('Failed to save User Test.');
    console.error('Error saving user test:', error);
  }
};
const resetForm = () => {
  setSelectedTest(null);
  setUserId('');
  setKraeplinTestId('');
  setStartTime(null);
  setEndTime(null);
  setIsModalOpen(false);
};
const handleEdit = (test) => {
  setSelectedTest(test);
  setUserId(test.user_id);
  setKraeplinTestId(test.kraeplin_test_id);
  setStartTime(new Date(test.start_time));
  setEndTime(new Date(test.end_time));
  setIsModalOpen(true);
};
const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'You are about to delete this user test!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, cancel!',
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`/user-tests/${id}`);
      toast.success('User Test deleted successfully.');
      fetchUserTests(); // Refresh data after deletion
    } catch (error) {
      toast.error('Failed to delete user test.');
      console.error('Error deleting user test:', error);
    }
  }
};

  return (
    <div className="container mx-auto p-4 bg-white text-black">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <button className="btn btn-outline btn-primary" onClick={() => setIsModalOpen(true)}>
          Add User Test
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
        data={filteredUserTests}
        selectableRows
        onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
        pagination
        className="rounded-lg shadow-lg bg-white"
        title="User Test List"
      />

      {isModalOpen && (
        <div className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
          <div className="modal-box">
            <h2>{selectedTest ? 'Edit User Test' : 'Add User Test'}</h2>

            {/* User Dropdown */}
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="" disabled>
                Select User
              </option>
              {users.length > 0 ? (
                users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))
              ) : (
                <option disabled>No users available</option>
              )}
            </select>

            {/* Kraeplin Test Dropdown */}
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

            {/* Start Time */}
            <DatePicker
              selected={startTime}
              onChange={(date) => setStartTime(date)}
              showTimeSelect
              dateFormat="Pp"
              className="input input-bordered w-full"
            />

            {/* End Time */}
            <DatePicker
              selected={endTime}
              onChange={(date) => setEndTime(date)}
              showTimeSelect
              dateFormat="Pp"
              className="input input-bordered w-full"
            />

            <div className="modal-action">
              <button className="btn btn-outline btn-success" onClick={saveUserTest}>
                {selectedTest ? 'Update' : 'Create'}
              </button>
              <button className="btn btn-outline btn-danger" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTestManager;
