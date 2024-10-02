import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logout from './Logout';
import axios from 'axios';
import Joyride from 'react-joyride';

const Layout = ({ children }) => {
    const [accessibleMenuItems, setAccessibleMenuItems] = useState([]);
    const [currentTheme, setCurrentTheme] = useState('autumn'); // Default theme
    const [tourSteps, setTourSteps] = useState([]);// eslint-disable-next-line
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

                if (response.data && Array.isArray(response.data.menus)) {
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

    // Set theme dynamically by updating the data-theme attribute on the HTML tag
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', currentTheme);
    }, [currentTheme]);

    const handleThemeChange = (e) => {
        setCurrentTheme(e.target.value); // Update current theme based on dropdown selection
    };

    const handleDeleteOrder = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                method: 'DELETE',
            });
            if (response.ok) {
                // Remove the deleted order from cartItems
                setCartItems(cartItems.filter(item => item.id !== orderId));
            }
        } catch (error) {
            console.error("Failed to delete order:", error);
        }
    };

    const handleBulkDelete = async () => {
        try {
            const orderIds = cartItems.map(item => item.id);
            const token = localStorage.getItem('token');

            const response = await fetch('/orders/bulk-delete', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: orderIds }),
            });

            if (response.ok) {
                setCartItems([]); // Hapus semua order dari keranjang jika berhasil
            } else {
                console.error("Failed to bulk delete orders, status:", response.status);
            }
        } catch (error) {
            console.error("Failed to bulk delete orders:", error);
        }
    };

    // Fetch Cart Items from API
    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const user_id = localStorage.getItem('id'); // Ambil user_id dari localStorage
                const token = localStorage.getItem('token');

                const response = await axios.get(`/orders?user_id=${user_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setCartItems(response.data); // Simpan data pesanan ke state
            } catch (error) {
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

        const hasChildren = Array.isArray(menu.children) && menu.children.length > 0;

        return (
            <li key={menu.id} className="dropdown dropdown-hover">
                <div className="cursor-pointer flex items-center justify-between">
                    <Link
                        to={menu.url}
                        className={`transition-colors duration-200 ease-in-out dropdown-toggle ${location.pathname === menu.url ? 'text-gray underline' : 'badge:bg-yellow-100 badge:text-black'
                            }`}
                    >
                        <i className={menu.icon_name} aria-hidden="true" style={{ color: 'gold' }}></i>
                        <span className="ml-2">{menu.menu_name}</span>
                    </Link>
                    {hasChildren && (
                        <label tabIndex={0} >
                            {openMenu[menu.id]}
                        </label>
                    )}
                </div>

                {hasChildren && (
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        {menu.children.map((child) => (
                            <li key={child.id}>
                                <Link
                                    to={child.url}
                                    className={`${location.pathname === child.url ? 'underline text-black' : 'text-gray-700'}`}
                                >
                                    <i className={child.icon_name} aria-hidden="true" style={{ color: 'red' }}></i>
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
            <nav className={`navbar bg-primary text-primary-content sticky top-0 z-50 w-full ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} px-4 shadow-md flex items-center justify-between`}>

                <Link to="/">
                    <button className="text-2xl font-bold">
                        <i className="fa fa-university" aria-hidden="true"></i>
                        <i style={{ color: 'white' }}>Edu</i>
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
                        {accessibleMenuItems.length > 0 ? (
                            accessibleMenuItems.map((menu) => renderMenu(menu))
                        ) : (
                            <li>Tidak ada menu yang tersedia</li>
                        )}
                    </ul>



                    {/* Icon keranjang */}
                    <button onClick={toggleCartModal} className="btn btn-ghost">
                        <i className="fa fa-cart-plus text-lg"></i>
                        <span className="indicator-item badge badge-secondary text-white">{Array.isArray(cartItems) ? cartItems.length : 0}</span>
                    </button>
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full">
                                <img
                                    alt="Tailwind CSS Navbar component"
                                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                            </div>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm text-black dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                            <li>
                                <a href="/profile" className="justify-between">
                                    Profile
                                    <span className="badge badge-secondary text-white">New</span>
                                </a>

                            </li>
                            <li><a href="/setting"> Settings</a></li>
                            <li><Logout /></li>
                        </ul>
                    </div>

                    {/* Modal keranjang */}
                    {isCartModalOpen && (
                        <div className="modal modal-open">
                            <div className="modal-box">
                                <button
                                    className="absolute top-2 right-2 btn btn-sm btn-circle"
                                    onClick={toggleCartModal}
                                >
                                    ✕
                                </button>
                                <h3 className="font-bold text-lg text-black">Keranjang Pesanan</h3>
                                {Array.isArray(cartItems) && cartItems.length > 0 ? (
                                    <ul>
                                        {cartItems.map((item) => (
                                            <li key={item.id} className="mb-2 border p-4 text-black">
                                                <Link to={`/order/${item.id}`}>
                                                    <span>Order ID: {item.id}</span> <br />
                                                    <span>Total Price: Rp {item.total_price.toLocaleString()}</span> <br />
                                                    <span>Status: <div className="badge badge-warning badge-outline">{item.payment_status}</div></span>
                                                </Link>
                                                <button
                                                    className="btn btn-danger mt-2"
                                                    onClick={() => handleDeleteOrder(item.id)}>
                                                    Hapus Order
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
  <img src="./empty-cart.png" width="200" alt="Empty Cart" />
</div>
                                )}

                                {Array.isArray(cartItems) && cartItems.length > 0 && (
                                    <button
                                        className="btn btn-danger mt-4"
                                        onClick={handleBulkDelete}>
                                        Hapus Semua Order
                                    </button>
                                )}


                            </div>
                        </div>
                    )}

                </div>
            </nav>

            {/* Main content */}
            <main className="flex-grow p-4">
                {children}
            </main>
            {/* Footer */}
            <footer className="footer footer-center bg-primary text-primary-content text-base-content p-4 mt-auto w-full">
                <aside>
                    <p>Copyright © {new Date().getFullYear()} - All rights reserved by Edu LMS</p>
                </aside>
            </footer>
        </div>
    );
};

export default Layout;
