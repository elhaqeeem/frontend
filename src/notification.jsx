import React, { useState, useEffect } from "react";
import axios from "./axiosInstance";

const SendNotificationPage = () => {
  const [notificationData, setNotificationData] = useState({
    title: "",
    body: "",
    token: "",
    image: "",
    fileURL: "",
  });

  const [broadcastData, setBroadcastData] = useState({
    title: "",
    body: "",
    tokens: [],
    image: "",
    fileURL: "",
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [error, setError] = useState(""); // Error state for API calls

  // Fetch users to populate the token select options
  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await axios.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data || []);
    } catch (error) {
      setError(
        error.response ? error.response.data.error : "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch users when the component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleNotificationChange = (e) => {
    const { name, value } = e.target;
    setNotificationData({
      ...notificationData,
      [name]: value,
    });
  };

  const handleBroadcastChange = (e) => {
    const { name, value } = e.target;
    setBroadcastData({
      ...broadcastData,
      [name]: value,
    });
  };

  const handleSendNotification = async () => {
    try {
      const response = await axios.post("/send-notification", notificationData);
      alert(response.data.message);
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Failed to send notification.");
    }
  };

  const handleSendBroadcast = async () => {
    try {
      const response = await axios.post("/send-broadcast", {
        ...broadcastData,
        tokens: broadcastData.tokens, // tokens is already an array
      });
      alert(response.data.message);
    } catch (error) {
      console.error("Error sending broadcast:", error);
      alert("Failed to send broadcast notification.");
    }
  };

  return (
    <div className="container mx-auto p-12">
      {/* Single Notification Form */}
      <div className="card w-full max-w-xl bg-base-100 shadow-xl p-6 mb-8 mx-auto">
        <h3 className="text-2xl font-semibold mb-4">Single Notification</h3>

        <div className="flex space-x-4 mb-4">
          <div className="flex-1">
            <label className="label">
              <span className="label-text">Title:</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              name="title"
              value={notificationData.title}
              onChange={handleNotificationChange}
            />
          </div>
          <div className="flex-1">
            <label className="label">
              <span className="label-text">Body:</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              name="body"
              value={notificationData.body}
              onChange={handleNotificationChange}
            />
          </div>
        </div>

        <div className="flex space-x-4 mb-4">
          <div className="flex-1">
            <label className="label">
              <span className="label-text">Token:</span>
            </label>
            <select
              className="select select-bordered w-full"
              name="token"
              value={notificationData.token}
              onChange={handleNotificationChange}
            >
              <option value="">Select Token</option>
              {users.map((user) => (
                <option key={user.id} value={user.device_info.fcm_token}>
                  {user.first_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="label">
              <span className="label-text">Image URL (optional):</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              name="image"
              value={notificationData.image}
              onChange={handleNotificationChange}
            />
          </div>
        </div>

        <div className="flex space-x-4 mb-4">
          <div className="flex-1">
            <label className="label">
              <span className="label-text">File URL (optional):</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              name="fileURL"
              value={notificationData.fileURL}
              onChange={handleNotificationChange}
            />
          </div>
        </div>

        <button
          className="btn btn-primary w-full"
          onClick={handleSendNotification}
        >
          Send Notification
        </button>
      </div>

      {/* Broadcast Notification Form */}
      <div className="card w-full max-w-xl bg-base-100 shadow-xl p-6 mx-auto">
        <h3 className="text-2xl font-semibold mb-4">Broadcast Notification</h3>

        <div className="flex space-x-4 mb-4">
          <div className="flex-1">
            <label className="label">
              <span className="label-text">Title:</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              name="title"
              value={broadcastData.title}
              onChange={handleBroadcastChange}
            />
          </div>
          <div className="flex-1">
            <label className="label">
              <span className="label-text">Body:</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              name="body"
              value={broadcastData.body}
              onChange={handleBroadcastChange}
            />
          </div>
        </div>

        <div className="flex space-x-4 mb-4">
          <div className="flex-1">
            <label className="label">
              <span className="label-text">Tokens:</span>
            </label>
            <select
              className="select select-bordered w-full"
              name="tokens"
              value={broadcastData.tokens}
              onChange={(e) => handleBroadcastChange(e)}
              multiple
            >
              {users.map((user) => (
                <option key={user.id} value={user.device_info.fcm_token}>
                  {user.first_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="label">
              <span className="label-text">Image URL (optional):</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              name="image"
              value={broadcastData.image}
              onChange={handleBroadcastChange}
            />
          </div>
        </div>

        <div className="flex space-x-4 mb-4">
          <div className="flex-1">
            <label className="label">
              <span className="label-text">File URL (optional):</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              name="fileURL"
              value={broadcastData.fileURL}
              onChange={handleBroadcastChange}
            />
          </div>
        </div>

        <button
          className="btn btn-success w-full"
          onClick={handleSendBroadcast}
        >
          Send Broadcast
        </button>
      </div>
    </div>
  );
};

export default SendNotificationPage;
