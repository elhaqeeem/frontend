import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ZoomMtg } from '@zoomus/websdk';

const ZoomIntegration = () => {
  const [meetingData, setMeetingData] = useState({
    meetingId: '',
    password: '',
    userName: '',
  });
  const [isMeetingStarted, setIsMeetingStarted] = useState(false);

  useEffect(() => {
    ZoomMtg.setZoomJSLib('https://source.zoom.us/2.10.0/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareJssdk();
  }, []);

  const handleJoinMeeting = () => {
    const { meetingId, password, userName } = meetingData;

    if (!meetingId || !userName) {
      toast.error('Meeting ID and your name are required.');
      return;
    }

    const meetingConfig = {
      meetingId,
      userName,
      password,
    };

    ZoomMtg.join({
      meetingNumber: meetingConfig.meetingId,
      userName: meetingConfig.userName,
      signature: generateSignature(meetingConfig), // Implement your signature logic
      apiKey: process.env.REACT_APP_ZOOM_API_KEY,  // Access the API key from .env
      passWord: meetingConfig.password,
      success: () => {
        toast.success('Successfully joined the meeting.');
        setIsMeetingStarted(true);
      },
      error: (error) => {
        toast.error('Failed to join the meeting.');
        console.error('Join meeting error:', error);
      },
    });
  };

  const generateSignature = (meetingConfig) => {
    // Implement your signature generation logic here
    return 'YOUR_GENERATED_SIGNATURE';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMeetingData({ ...meetingData, [name]: value });
  };

  return (
    <div className="container mx-auto p-4 bg-white text-black">
      <ToastContainer position="top-right" />
      <h2 className="font-bold text-lg mb-4">Zoom Meeting Integration</h2>

      <input
        type="text"
        name="meetingId"
        placeholder="Meeting ID"
        value={meetingData.meetingId}
        onChange={handleInputChange}
        className="input input-bordered w-full mb-2"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Meeting Password (optional)"
        value={meetingData.password}
        onChange={handleInputChange}
        className="input input-bordered w-full mb-2"
      />
      <input
        type="text"
        name="userName"
        placeholder="Your Name"
        value={meetingData.userName}
        onChange={handleInputChange}
        className="input input-bordered w-full mb-2"
        required
      />
      <button className="btn btn-primary" onClick={handleJoinMeeting}>
        Join Meeting
      </button>

      {isMeetingStarted && <div className="mt-4">Meeting is in progress...</div>}
    </div>
  );
};

export default ZoomIntegration;
