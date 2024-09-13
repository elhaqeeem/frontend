import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import Logout from './Logout';
import axios from 'axios';
import Joyride from 'react-joyride';

const Layout = ({ children }) => {
    const [accessibleMenuItems, setAccessibleMenuItems] = useState([]);
    const [currentTheme, setCurrentTheme] = useState('cupcake');
    const [tourSteps, setTourSteps] = useState([]);
    const [runTour, setRunTour] = useState(false);
    const [openMenu, setOpenMenu] = useState({});
    const [permissions, setPermissions] = useState([]); // Store permissions
    const location = useLocation();
    const navigate = useNavigate(); // To navigate after permission check failure

    const themes = [
        "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", 
        "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", 
        "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", 
        "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter", 
        "dim", "nord", "sunset"
    ];
    

    useEffect(() => {
        const fetchAccessibleMenus = async () => {
            const roleId = localStorage.getItem('roleID');
            if (!roleId) return;

            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`/role/${roleId}/menus`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.menus) {
                    const menuMap = {};
                    const rootMenus = [];

                    response.data.menus.forEach((menu) => {
                        menuMap[menu.id] = { ...menu, children: [] };
                    });

                    response.data.menus.forEach((menu) => {
                        if (menu.parent_id === null) {
                            rootMenus.push(menuMap[menu.id]);
                        } else if (menuMap[menu.parent_id]) {
                            menuMap[menu.parent_id].children.push(menuMap[menu.id]);
                        }
                    });

                    setAccessibleMenuItems(rootMenus);
                }
            } catch (error) {
                console.error('Error fetching accessible menus:', error);
            }
        };

        const fetchPermissions = async () => {
            const roleId = localStorage.getItem('roleID');
            if (!roleId) return;

            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`/roles/${roleId}/permissions`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.permissions) {
                    setPermissions(response.data.permissions);
                }
            } catch (error) {
                console.error('Error fetching permissions:', error);
            }
        };

        fetchAccessibleMenus();
        fetchPermissions();
    }, []);

    useEffect(() => {
        const steps = [
            {
                target: '.select',
                content: 'Select theme to customize your frame.',
            },
            {
                target: '.navbar',
                content: 'Here are your accessible menu items in the topbar.',
            },
            {
                target: 'main',
                content: 'This is where your main content will be displayed.',
            },
        ];
        setTourSteps(steps);
    }, []);

    // Set theme dynamically
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', currentTheme);
    }, [currentTheme]);

    const handleThemeChange = (e) => {
        setCurrentTheme(e.target.value);
    };

    const handleToggle = (id) => {
        setOpenMenu((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const checkPermission = (menuId) => {
        return permissions.some((perm) => perm.menu_id === menuId);
    };

    const handleMenuClick = (menu) => {
        if (!checkPermission(menu.id)) {
            alert('You do not have permission to access this menu.');
            return;
        }
        navigate(menu.url); // Navigate only if permission check passes
    };

    const renderMenu = (menu) => {
        if (!menu || !menu.menu_name || !menu.url) {
            return null;
        }

        const hasChildren = menu.children && menu.children.length > 0;

        return (
            <li key={menu.id} className="dropdown dropdown-hover">
                <div className="cursor-pointer flex items-center justify-between">
                    <a
                        onClick={() => handleMenuClick(menu)}
                        className={`transition-colors duration-200 ease-in-out dropdown-toggle ${
                            location.pathname === menu.url ? 'bg-gray-700 text-white' : 'hover:bg-gray-800 hover:text-white'
                        }`}
                    >
                        <i className={menu.icon_name} aria-hidden="true"></i>
                        <span className="ml-2">{menu.menu_name}</span>
                    </a>
                    {hasChildren && (
                        <label tabIndex={0} className="ml-2 btn btn-ghost btn-circle" onClick={() => handleToggle(menu.id)}>
                            {openMenu[menu.id] ? '-' : '+'}
                        </label>
                    )}
                </div>

                {hasChildren && (
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        {menu.children.map((child) => renderMenu(child))}
                    </ul>
                )}
            </li>
        );
    };

    return (
        <div className="min-h-screen">
            <Joyride
                steps={tourSteps}
                run={runTour}
                continuous
                showSkipButton
                styles={{
                    buttonClose: { display: 'none' },
                }}
            />

            <nav className={`navbar sticky top-0 z-50 ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} px-4 shadow-md`}>
                <div className="flex-1">
                    <a className="text-2xl font-bold">
                        <i className="fa fa-globe" aria-hidden="true"></i> Edu<strong>LMS</strong>
                    </a>
                </div>
                <div className="flex-none">
                    <select onChange={handleThemeChange} value={currentTheme} className="select select-bordered mr-4">
                        {themes.map((theme) => (
                            <option key={theme} value={theme}>
                                {theme.charAt(0).toUpperCase() + theme.slice(1)}
                            </option>
                        ))}
                    </select>
                    <ul className="menu menu-horizontal p-0">
                        {accessibleMenuItems.map((menu) => renderMenu(menu))}
                    </ul>
                    <Logout />
                    <button onClick={() => setRunTour(true)} className="ml-4 btn btn-primary">
                        Start Tour
                    </button>
                </div>
            </nav>

            <main className="p-6 text-sm">{children}</main>
        </div>
    );
};

export default Layout;
