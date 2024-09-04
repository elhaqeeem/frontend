import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './Layout'; // Adjust the path if necessary
import Dashboard from './Dashboard';
import Login from './Login';
import UserDataTable from './UserDataTable';
import RoleDataTable from './RoleDataTable'; // Import the RoleDataTable component
import PermissionDataTable from './PermissionDataTable'; // Import the RoleDataTable component
import RolePermissionComponent from './RolePermissionComponent'; // Import the RoleDataTable component
import MenuManager from './MenuManager'; // Import the RoleDataTable component
import ArticleManager from './ArticleManager'; // Import the RoleDataTable component
import RoleMenuDataTable from './RoleMenuDataTable'; // Import the RoleDataTable component
import MenuIconManager from './MenuIconManager'; // Import the RoleDataTable component


import { ToastContainer } from 'react-toastify';
import 'font-awesome/css/font-awesome.min.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        // Initialize state based on localStorage value
        return !!localStorage.getItem('token');
    });

    useEffect(() => {
        // Check for token on mount
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    const PrivateRoute = ({ element }) => (
        isAuthenticated ? element : <Navigate to="/login" />
    );

    return (
        <Router>
            <ToastContainer />
            <Routes>
                <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
                <Route 
                    path="/" 
                    element={
                        <PrivateRoute 
                            element={
                                <Layout>
                                    <Dashboard />
                                </Layout>
                            } 
                        />
                    } 
                />
                <Route 
                    path="/users" 
                    element={
                        <PrivateRoute 
                            element={
                                <Layout>
                                    <UserDataTable />
                                </Layout>
                            } 
                        />
                    } 
                />
                <Route 
                    path="/roles" // New route for managing roles
                    element={
                        <PrivateRoute 
                            element={
                                <Layout>
                                    <RoleDataTable /> {/* Render the RoleDataTable component */}
                                </Layout>
                            } 
                        />
                    } 
                />
            
                {/* Add other protected routes here */}
                <Route 
                    path="/permissions" // New route for managing roles
                    element={
                        <PrivateRoute 
                            element={
                                <Layout>
                                    <PermissionDataTable /> {/* Render the RoleDataTable component */}
                                </Layout>
                            } 
                        />
                    } 
                />
                <Route 
                    path="/rolepermissions" // New route for managing roles
                    element={
                        <PrivateRoute 
                            element={
                                <Layout>
                                    <RolePermissionComponent /> {/* Render the RoleDataTable component */}
                                </Layout>
                            } 
                        />
                    } 
                />
                <Route 
                    path="/menumanager" // New route for managing roles
                    element={
                        <PrivateRoute 
                            element={
                                <Layout>
                                    <MenuManager /> {/* Render the RoleDataTable component */}
                                </Layout>
                            } 
                        />
                    } 
                />
                 <Route 
                    path="/article" // New route for managing roles
                    element={
                        <PrivateRoute 
                            element={
                                <Layout>
                                    <ArticleManager /> {/* Render the RoleDataTable component */}
                                </Layout>
                            } 
                        />
                    } 
                />
                <Route 
                    path="/access-menu" // New route for managing roles
                    element={
                        <PrivateRoute 
                            element={
                                <Layout>
                                    <RoleMenuDataTable /> {/* Render the RoleDataTable component */}
                                </Layout>
                            } 
                        />
                    } 
                />
                 <Route 
                    path="/icon-menu" // New route for managing roles
                    element={
                        <PrivateRoute 
                            element={
                                <Layout>
                                    <MenuIconManager /> {/* Render the RoleDataTable component */}
                                </Layout>
                            } 
                        />
                    } 
                />
            </Routes>
            
        </Router>
    );
}

export default App;
