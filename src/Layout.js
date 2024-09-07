import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logout from './Logout';
import axios from 'axios';
import Joyride from 'react-joyride';

const Layout = ({ children }) => {
    const [accessibleMenuItems, setAccessibleMenuItems] = useState([]);
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [tourSteps, setTourSteps] = useState([]);
    const [runTour, setRunTour] = useState(false);
    const [openMenu, setOpenMenu] = useState({});
    const location = useLocation();

    useEffect(() => {
        const fetchAccessibleMenus = async () => {
            const roleId = localStorage.getItem('roleID');
            if (!roleId) return;

            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`/role/${roleId}/menus`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.menus) {
                    const menuMap = {};
                    const rootMenus = [];

                    response.data.menus.forEach(menu => {
                        menuMap[menu.id] = { ...menu, children: [] };
                    });

                    response.data.menus.forEach(menu => {
                        if (menu.parent_id === null) {
                            rootMenus.push(menuMap[menu.id]);
                        } else {
                            menuMap[menu.parent_id].children.push(menuMap[menu.id]);
                        }
                    });

                    setAccessibleMenuItems(rootMenus);
                } else {
                    console.error('Invalid menu data format:', response.data);
                }
            } catch (error) {
                console.error('Error fetching accessible menus:', error);
            }
        };

        fetchAccessibleMenus();
    }, []);

    useEffect(() => {
        const steps = [
            {
                target: '.toggle',
                content: 'Toggle between light and dark themes.',
            },
            {
                target: 'ul',
                content: 'Here are your accessible menu items.',
            },
            {
                target: 'div.p-1',
                content: 'This is where your main content will be displayed.',
            },
        ];
        setTourSteps(steps);
    }, []);

    const toggleTheme = () => {
        setIsDarkTheme(!isDarkTheme);
        document.documentElement.classList.toggle('dark', !isDarkTheme);
    };

    const startTour = () => {
        setRunTour(true);
    };

    const handleToggle = (id) => {
        setOpenMenu((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const renderMenu = (menu) => (
        <li key={menu.id} className={`block py-2 px-4 text-sm ${location.pathname === menu.url ? 'bg-gray-700 text-white border-b-2 border-blue-500' : 'hover:bg-gray-700'} ${isDarkTheme ? 'hover:bg-gray-600' : 'hover:bg-gray-300'}`}>
            <div onClick={() => handleToggle(menu.id)} className="flex justify-between items-center cursor-pointer">
                <Link to={menu.url} className="block flex-1">
                    {menu.menu_name}
                </Link>
                {menu.children && menu.children.length > 0 && (
                    <span className="ml-2">
                        <i className={`fa ${openMenu[menu.id] ? 'fa-chevron-up' : 'fa-chevron-down'}`} aria-hidden="true"></i>
                    </span>
                )}
            </div>
            {menu.children && menu.children.length > 0 && openMenu[menu.id] && (
                <ul className="pl-4">
                    {menu.children.map(child => renderMenu(child))}
                </ul>
            )}
        </li>
    );

    return (
        <div className={`flex min-h-screen ${isDarkTheme ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
            <Joyride
                steps={tourSteps}
                run={runTour}
                continuous
                showSkipButton
                styles={{
                    buttonClose: { display: 'none' },
                }}
            />

            <div className={`w-64 ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-200'} p-4 shadow-lg sticky top-0 h-screen`}>
                <div className="text-2xl font-bold flex items-center mb-4">
                    <span className="mr-2">
                        <i className="fa fa-globe" aria-hidden="true"></i>
                        Edu<strong>LMS</strong>
                    </span>
                    <input
                        type="checkbox"
                        checked={isDarkTheme}
                        onChange={toggleTheme}
                        className="toggle toggle-accent"
                    />
                </div>

                <ul className="mt-6">
                    {accessibleMenuItems.map(menu => renderMenu(menu))}
                </ul>
                <div className="mt-4">
                    <Logout />
                    <button onClick={startTour} className="mt-4 btn btn-primary text-sm">
                        Start Tour
                    </button>
                </div>
            </div>

            <div className="flex-1 p-6 text-sm overflow-y-auto">
                {children}
            </div>
        </div>
    );
};

export default Layout;
