import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logout from './Logout';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';

const Layout = ({ children }) => {
    // eslint-disable-next-line
    const [menuItems, setMenuItems] = useState([]);
    const [accessibleMenuItems, setAccessibleMenuItems] = useState([]);
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    useEffect(() => {
        const fetchAccessibleMenus = async () => {
            const roleId = localStorage.getItem('role_id'); // Fetch role ID from local storage
            if (!roleId) return; // Exit if no role ID is found

            try {
                const token = localStorage.getItem('token'); // Fetch token from local storage
                const response = await axios.get(`/role/${roleId}/menus`, {
                    headers: {
                        'Authorization': `Bearer ${token}` // Include the Authorization header
                    }
                });

                // Check if the response data is valid and update state
                if (response.data && response.data.menus) {
                    const fetchedMenus = response.data.menus.map(menu => ({
                        id: menu.id.toString(), // Convert ID to string for consistency with Draggable IDs
                        label: menu.menu_name,
                        path: menu.url,
                    }));
                    setAccessibleMenuItems(fetchedMenus);
                } else {
                    console.error('Invalid menu data format:', response.data);
                }
            } catch (error) {
                console.error('Error fetching accessible menus:', error);
            }
        };

        fetchAccessibleMenus();
    }, []);

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const reorderedItems = Array.from(accessibleMenuItems);
        const [removed] = reorderedItems.splice(result.source.index, 1);
        reorderedItems.splice(result.destination.index, 0, removed);
        setAccessibleMenuItems(reorderedItems);
    };

    const toggleTheme = () => {
        setIsDarkTheme(!isDarkTheme);
        document.documentElement.classList.toggle('dark', !isDarkTheme);
    };

    return (
        <div className={`flex min-h-screen ${isDarkTheme ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
            <div className={`w-64 ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <div className="p-4 text-2xl font-bold">
                    <div className="flex items-center mb-4">
                        <span className="mr-2"><i class="fa fa-globe" aria-hidden="true"></i>
                        Edu<strong>LMS</strong></span>
                        <input
                            type="checkbox"
                            checked={isDarkTheme}
                            onChange={toggleTheme}
                            className="toggle toggle-accent"
                        />
                    </div>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable">
                        {(provided) => (
                            <ul
                                className="mt-6"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {accessibleMenuItems.map((item, index) => (
                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                        {(provided) => (
                                            <li
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`block py-2 px-4 hover:bg-gray-700 ${isDarkTheme ? 'hover:bg-gray-600' : 'hover:bg-gray-300'}`}
                                            >
                                                <Link to={item.path} className="block">
                                                    {item.label}
                                                </Link>
                                            </li>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </ul>
                        )}
                    </Droppable>
                </DragDropContext>
                <div className="mt-4">
                    <Logout />
                </div>
            </div>

            <div className="flex-1 p-6">
                {children}
            </div>
        </div>
    );
};

export default Layout;
