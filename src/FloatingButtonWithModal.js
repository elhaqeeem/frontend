import React, { useState } from 'react';

function FloatingButtonWithModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div>
      {/* Floating Button */}
      <div
        tabIndex={0}
        role="button"
        style={{
          position: 'fixed', /* Floating in the corner */
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          cursor: 'pointer',
        }}
        onClick={toggleModal}
      >
        <div className="btn btn-ghost btn-circle avatar">
          <div className="w-10 rounded-full">
            <img
              alt="User Avatar"
              src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1001,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              width: '300px',
              textAlign: 'center',
            }}
          >
            <h3 className="text-lg font-bold mb-4">User Menu</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>
                <a href="/profile" className="flex items-center justify-start">
                  <i className="fa fa-users mr-2" aria-hidden="true" style={{ color: 'red' }}></i>
                  Profile
                </a>
              </li>
              <li className="mt-2">
                <a href="/setting" className="flex items-center justify-start">
                  <i className="fa fa-gear mr-2" aria-hidden="true" style={{ color: 'red' }}></i>
                  Settings
                </a>
              </li>
              <li className="mt-2">
                <Logout />
              </li>
            </ul>
            <button
              className="btn mt-4"
              onClick={toggleModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FloatingButtonWithModal;
