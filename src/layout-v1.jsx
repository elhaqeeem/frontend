import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logout from './Logout';
import axios from './axiosInstance'; // Import axios instance with base URL
import Joyride from 'react-joyride';
import axiosInstance from './axiosInstance';

const Layout = ({ children }) => {
    const [accessibleMenuItems, setAccessibleMenuItems] = useState([]);
    const [currentTheme, setCurrentTheme] = useState('autumn'); // Default theme
    const [tourSteps, setTourSteps] = useState([]);
    const [runTour, setRunTour] = useState(false);// eslint-disable-next-line
    const [openMenu, setOpenMenu] = useState({});
    const [cartItems, setCartItems] = useState([]); // State untuk item di keranjang
    const [isCartModalOpen, setIsCartModalOpen] = useState(false); // State untuk mengontrol modal keranjang
    const location = useLocation();

    
    const themes = [
        "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave",
        "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua",
        "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula",
        "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter",
        "dim", "nord", "sunset"
    ];

    // Fetch accessible menus
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

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const id = localStorage.getItem('id');  // Ambil user_id dari localStorage
                const token = localStorage.getItem('token');
        
                // Tambahkan log untuk memeriksa nilai id dan token
                console.log("User ID from localStorage:", id);
                console.log("Token from localStorage:", token);
        
                // Menggunakan user_id di dalam URL
                const response = await axiosInstance.get(`/orders/user/${id}`, { // Pastikan endpointnya benar
                    params: {
                        payment_status: 'pending'  // Filter jika perlu
                    },
                    headers: {
                        Authorization: `Bearer ${token}`, // Pastikan token dikirim dengan benar
                    },
                });
        
                // Log response dari server untuk memeriksa data yang diterima
                console.log("Response from API:", response.data);
        
                setCartItems(response.data); // Simpan data pesanan ke state
            } catch (error) {
                // Log error jika terjadi masalah dalam pengambilan data
                console.error('Error fetching cart items:', error);
            }
        };
    
        fetchCartItems();
    }, []); // Dependency array kosong agar hanya berjalan sekali saat komponen dimount
    


    const toggleCartModal = () => {
        setIsCartModalOpen(!isCartModalOpen); // Toggle modal keranjang
    };

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
                        className={`transition-colors duration-200 ease-in-out dropdown-toggle ${
                            location.pathname === menu.url ? 'text-black underline' : 'badge:bg-yellow-100 badge:text-black'
                        }`} // Underline untuk item aktif, badge-style untuk tidak aktif
                    >
                        {/* Menambahkan ikon dari menu.icon_name */}
                        <i className={menu.icon_name} aria-hidden="true"></i> {/* Menggunakan icon_name yang valid */}
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
                                    {/* Menambahkan ikon dari child.icon_name */}
                                    <i className={child.icon_name} aria-hidden="true"></i> {/* Menggunakan icon_name yang valid */}
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
        <div className="min-h-screen flex flex-col overflow-x-hidden">
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
            <nav className={`navbar sticky top-0 z-50 w-full ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} px-4 shadow-md flex items-center justify-between`}>

                <Link to="/">
                    <button className="text-2xl font-bold">
                        <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
                        <i style={{ color: 'gray' }}>Edu</i>
                        <i><strong style={{ color: 'orange' }}>LMS</strong></i>
                    </button>
                </Link>

                <div className="flex items-center space-x-4">
                    <select onChange={handleThemeChange} value={currentTheme} className="select select-bordered hidden md:inline-block">
                        {themes.map((theme) => (
                            <option key={theme} value={theme}>
                                {theme.charAt(0).toUpperCase() + theme.slice(1)}
                            </option>
                        ))}
                    </select>

                    {/* Menu yang dapat diakses */}
                    <ul className="menu menu-horizontal p-0 hidden lg:flex">
                        {accessibleMenuItems.map((menu) => renderMenu(menu))}
                    </ul>

                    {/* Keranjang */}
                    <button className="btn btn-outline btn-secondary" onClick={toggleCartModal}>
                        <i className="fa fa-shopping-cart" aria-hidden="true"></i>
                        <span className="badge badge-sm badge-primary">{cartItems.length}</span>
                    </button>

                    <Logout />
                    <button onClick={() => setRunTour(true)}className="btn btn-circle btn-secondary fixed bottom-8 left-8 shadow-lg">
                        ?
                    </button>
                </div>
            </nav>

           

            {/* Main content area */}
            <main className="flex-grow p-6 text-sm w-full max-w-7xl mx-auto overflow-x-hidden">
                {children}
            </main>
                         {/* Modal Keranjang */}
            {isCartModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-64 md:w-96">
                        <h2 className="text-xl font-bold mb-4">Keranjang</h2>
                        {cartItems.length > 0 ? (
                            <ul>
                                {cartItems.map((item) => (
                                    <li key={item.id} className="mb-2">
                                        <Link to={`/order/${item.id}`}>
                                            <span>Order ID: {item.id}</span> <br />
                                            <span>Total Price: Rp {item.total_price.toLocaleString()}</span> <br />
                                            <span>Status: {item.payment_status}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Keranjang kosong</p>
                        )}
                        <div className="flex justify-end mt-4">
                            <button className="btn btn-secondary" onClick={toggleCartModal}>Tutup</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Footer */}
            <footer className="footer footer-center bg-base-300 text-base-content p-4 mt-auto w-full">
                <aside>
                    <p>Copyright © {new Date().getFullYear()} - All rights reserved by Edu LMS</p>
                </aside>
            </footer>
        </div>
    );
};

export default Layout;
