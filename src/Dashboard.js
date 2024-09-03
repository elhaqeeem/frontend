import React from 'react';

function Dashboard() {
    return (
        <div className="flex min-h-screen">
          
            {/* Main Content */}
            <div className="flex-1 p-6 bg-gray-100">
                <h1 className="text-3xl font-bold">Welcome to the Dashboard</h1>
                <p className="mt-4">This is your dashboard where you can manage your content.</p>
                {/* Add more content here */}
            </div>
        </div>
    );
}

export default Dashboard;
