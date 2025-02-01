import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './Layout-ori'; // Sesuaikan path jika perlu
import Dashboard from './Dashboard';
import Login from './Login';
import UserDataTable from './UserDataTable';
import RoleDataTable from './RoleDataTable';
import PermissionDataTable from './PermissionDataTable';
import RolePermissionComponent from './RolePermissionComponent';
import MenuManager from './MenuManager';
import ArticleManager from './ArticleManager';
import RoleMenuDataTable from './RoleMenuDataTable';
import MenuIconManager from './MenuIconManager';
import CreateKraeplin from './KraeplinTestManager';
import QuestionManager from './QuestionManager';
import UserTestManager from './UserTestManager';
import TestAnswerManager from './TestAnswers';
import TestResultManager from './TestResultManager';
import RoleMenuManager from './RoleMenuManager';
import Quiz from './Quiz';
import QuizMath from './Quiz-math';
import CourseManager from './CourseManager';
import MaterialManager from './MaterialManager';
import QuizKraeplin from './Quiz-kraeplin';
import TestItemManager from './TestItemManager';
import ImageManager from './ImageManager';
import KraeplinTestResultManager from './KraeplinTest';
import { ToastContainer } from 'react-toastify';
import Register from './register';
import Materialsdata from './materialdata';
import ClassManager from './class';
import QuizKoran from './Quiz-Koran';
import QuestionManagerCfit from './QuestionCfit';
import SendNotificationPage from './notification';
import MergedPage from './lacak';
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!localStorage.getItem('token');
    });

    useEffect(() => {
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
                    <Route path="/register" element={<Register onLogin={() => setIsAuthenticated(true)} />} />
                    <Route 
                        path="/" 
                        element={<PrivateRoute element={<Layout>
                            <Dashboard />

                            </Layout>} />} 
                    />
                    <Route 
                        path="/users" 
                        element={<PrivateRoute element={<Layout><UserDataTable /></Layout>} />} 
                    />
                    <Route 
                        path="/roles" 
                        element={<PrivateRoute element={<Layout><RoleDataTable /></Layout>} />} 
                    />
                    <Route 
                        path="/permissions" 
                        element={<PrivateRoute element={<Layout><PermissionDataTable /></Layout>} />} 
                    />
                    <Route 
                        path="/rolepermissions" 
                        element={<PrivateRoute element={<Layout><RolePermissionComponent /></Layout>} />} 
                    />
                    <Route 
                        path="/menumanager" 
                        element={<PrivateRoute element={<Layout><MenuManager /></Layout>} />} 
                    />
                    <Route 
                        path="/article" 
                        element={<PrivateRoute element={<Layout><ArticleManager /></Layout>} />} 
                    />
                    <Route 
                        path="/access-menu" 
                        element={<PrivateRoute element={<Layout><RoleMenuDataTable /></Layout>} />} 
                    />
                    <Route 
                        path="/icon-menu" 
                        element={<PrivateRoute element={<Layout><MenuIconManager /></Layout>} />} 
                    />
                    <Route 
                        path="/kreaeplin" 
                        element={<PrivateRoute element={<Layout><CreateKraeplin /></Layout>} />} 
                    />
                    <Route 
                        path="/questions" 
                        element={<PrivateRoute element={<Layout><QuestionManager /></Layout>} />} 
                    />
                     <Route 
                        path="/questions-cfit" 
                        element={<PrivateRoute element={<Layout><QuestionManagerCfit /></Layout>} />} 
                    />
                    <Route 
                        path="/usertest" 
                        element={<PrivateRoute element={<Layout><UserTestManager /></Layout>} />} 
                    />
                    <Route 
                        path="/useranswer" 
                        element={<PrivateRoute element={<Layout><TestAnswerManager /></Layout>} />} 
                    />
                    <Route 
                        path="/quiz" 
                        element={<PrivateRoute element={<Layout><Quiz /></Layout>} />} 
                    />
                     <Route 
                        path="/quiz-math" 
                        element={<PrivateRoute element={<Layout><QuizMath /></Layout>} />} 
                    />
                     <Route 
                        path="/quiz-koran" 
                        element={<PrivateRoute element={<Layout><QuizKoran /></Layout>} />} 
                    />
                    <Route 
                        path="/resulttest" 
                        element={<PrivateRoute element={<Layout><TestResultManager /></Layout>} />} 
                    />
                    <Route 
                        path="/rolemenu" 
                        element={<PrivateRoute element={<Layout><RoleMenuManager /></Layout>} />} 
                    />
                    <Route 
                        path="/course-manager" 
                        element={<PrivateRoute element={<Layout><CourseManager /></Layout>} />} 
                    />
                    <Route 
                        path="/material-manager" 
                        element={<PrivateRoute element={<Layout><MaterialManager /></Layout>} />} 
                    />
                     <Route 
                        path="/Quis-Kraeplin" 
                        element={<PrivateRoute element={<Layout><QuizKraeplin /></Layout>} />} 
                    />
                     <Route 
                        path="/Question-Kraeplin" 
                        element={<PrivateRoute element={<Layout><TestItemManager /></Layout>} />} 
                    />
                     <Route 
                        path="/File-Manager" 
                        element={<PrivateRoute element={<Layout><ImageManager /></Layout>} />} 
                    />
                    <Route 
                        path="/Kraeplin-Manager" 
                        element={<PrivateRoute element={<Layout><KraeplinTestResultManager /></Layout>} />} 
                    />
                    <Route 
                        path="/material-data" 
                        element={<PrivateRoute element={<Layout><Materialsdata /></Layout>} />} 
                    />
                     <Route 
                        path="/Class-data" 
                        element={<PrivateRoute element={<Layout><ClassManager /></Layout>} />} 
                    />
                    <Route 
                        path="/Notification" 
                        element={<PrivateRoute element={<Layout><SendNotificationPage /></Layout>} />} 
                    />
                    
                    <Route 
                        path="/Spy-material" 
                        element={<PrivateRoute element={<Layout><MergedPage /></Layout>} />} 
                    />
                    
                  
                </Routes>
            </Router>
    );
}

export default App;
