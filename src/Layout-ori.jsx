import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logout from './Logout';
import axios from 'axios';
import Joyride from 'react-joyride';

const Layout = ({ children }) => {
    const [accessibleMenuItems, setAccessibleMenuItems] = useState([]);
    const [currentTheme, setCurrentTheme] = useState('nord'); // Default theme
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

        fetchAccessibleMenus();
    }, []);

    useEffect(() => {
        const steps = [
            {
                target: '.select',
                content: 'select theme to customize your frame.',
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

    // Set theme dynamically by updating the data-theme attribute on the HTML tag
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', currentTheme);
    }, [currentTheme]);

    const handleThemeChange = (e) => {
        setCurrentTheme(e.target.value); // Update current theme based on dropdown selection
    };

    // eslint-disable-next-line
    const handleToggle = (id) => {
        setOpenMenu((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };
    const themes = [
        "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave",
        "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua",
        "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula",
        "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter",
        "dim", "nord", "sunset"
    ];
    const renderMenu = (menu) => {
        if (!menu || !menu.menu_name || !menu.url) {
            return null;
        }

        const hasChildren = menu.children && menu.children.length > 0;

        return (
            <li key={menu.id} className="dropdown dropdown-hover">
                <div className="cursor-pointer flex items-center justify-between">
                    <Link
                        to={menu.url}
                        className={`transition-colors duration-200 ease-in-out dropdown-toggle ${location.pathname === menu.url ? 'text-black underline' : 'badge:bg-yellow-100 badge:text-black'}`} // Underline untuk item aktif, badge-style untuk tidak aktif
                    >
                        <i className={menu.icon_name} aria-hidden="true"></i>
                        <span className="ml-2">{menu.menu_name}</span>
                    </Link>
                    {hasChildren && (
                        <label tabIndex={0} className="ml-2 btn btn-ghost btn-circle">
                            {openMenu[menu.id] ? '-' : '+'}
                        </label>
                    )}
                </div>

                {hasChildren && (
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        {menu.children.map((child) => (
                            <li key={child.id}>
                                <Link
                                    to={child.url}
                                    className={`${location.pathname === child.url ? 'underline text-black' : 'text-gray-700'}`} // Underline untuk link aktif, dan warna teks untuk tidak aktif
                                >
                                    <i className={child.icon_name} aria-hidden="true"></i>
                                    <span className="ml-2">{child.menu_name}</span>
                                </Link>
                            </li>
                        ))}
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

            {/* Topbar navigation menu */}
            <nav className={`navbar sticky top-0 z-50 ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} px-4 shadow-md`}>
                <div className="flex-1">
                    <button className="text-2xl font-bold">
                        <i className="fa fa-globe" aria-hidden="true"></i> Edu<strong>LMS</strong>
                    </button>
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

            {/* Main content area */}
            <main className="p-6 text-sm">{children}</main>
            <footer className="footer footer-center bg-base-300 text-base-content p-4">
                <aside>
                    <p>Copyright © {new Date().getFullYear()} - All right reserved by Edu LMS</p>
                </aside>
            </footer>
        </div>
    );
};

export default Layout;
