import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logout from './Logout';
import Joyride from 'react-joyride';
import axiosInstance from './axiosInstance';

const Layout = ({ children }) => {
    const [accessibleMenuItems, setAccessibleMenuItems] = useState([]);
    const [currentTheme, setCurrentTheme] = useState('autumn'); // Default theme
    const [tourSteps, setTourSteps] = useState([]);// eslint-disable-next-line
    const [runTour, setRunTour] = useState(false);// eslint-disable-next-line
    const [openMenu, setOpenMenu] = useState({});
    const [cartItems, setCartItems] = useState([]); // State untuk item di keranjang
    const [isCartModalOpen, setIsCartModalOpen] = useState(false); // State untuk mengontrol modal keranjang
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // State untuk modal profile
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu state
    const location = useLocation();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };
    //const themes = [
    //    "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave",
    //    "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua",
    //    "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula",
    //    "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter",
    //    "dim", "nord", "sunset"
    //];

    // Fetch accessible menus
    useEffect(() => {
        const fetchAccessibleMenus = async () => {
            const roleId = localStorage.getItem('roleID');
            if (!roleId) return;

            try {
                const token = localStorage.getItem('token');
                const response = await axiosInstance.get(`/role/${roleId}/menus`, {
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



    // eslint-disable-next-line
    const handleThemeChange = (e) => {
        setCurrentTheme(e.target.value); // Update current theme based on dropdown selection
    };

    // Fetch cart items on component mount

    const toggleProfileModal = () => {
        setIsProfileModalOpen(!isProfileModalOpen); // Toggle modal profile
    };

    // Handle payment
    const handlePayment = async () => {
        try {
            const token = localStorage.getItem('token');
            const email = localStorage.getItem('email');
            const firstName = localStorage.getItem('firstName');
            //const user_id = localStorage.getItem('id'); 

            const customer = {
                first_name: firstName, // Replace with actual customer details
                email: email,
            };

            const response = await axiosInstance.post(
                '/payment',
                {
                    orders: cartItems,
                    customer: customer,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const paymentURLs = response.data.payment_urls;
            // Redirect the user to the first payment URL (or handle multiple orders as needed)
            if (paymentURLs.length > 0) {
                window.location.href = paymentURLs[0];
            }
        } catch (error) {
            console.error('Payment error:', error);
        }
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

                const response = await axiosInstance.get(`/orders/user/${user_id}`, {
                   
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
               <div className="tooltip tooltip-left" data-tip={menu.menu_name}>
    <Link
      to={menu.url}
      className={`transition-colors duration-200 ease-in-out ${location.pathname === menu.url ? 'text-gray underline' : 'badge:bg-yellow-100 badge:text-black'}`}
    >
      {/* Display only the icon */}
      <i className={menu.icon_name} aria-hidden="true" style={{ color: 'gold' }}></i>
    </Link>
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
                {/* Mobile Menu Toggle Button */}


                <Link to="/">
                    <button className="text-2xl font-bold">
                     <i className="fa fa-university" aria-hidden="true"></i>
                        <i style={{ color: 'white' }}>Edu</i>
                        <i><strong style={{ color: 'orange' }}>LMS</strong></i>
                    </button>
                </Link>
                <button className="lg:hidden text-white" onClick={toggleMobileMenu}>
                    <i className="fa fa-bars"></i>
                </button>
                <div className={`lg:flex ${isMobileMenuOpen ? 'block' : 'hidden'} flex-col lg:flex-row`}>

                    {/*
                     <select onChange={handleThemeChange} value={currentTheme} className="select select-bordered text-black">
                        {themes.map((theme) => (
                            <option key={theme} value={theme}>
                                {theme.charAt(0).toUpperCase() + theme.slice(1)}
                            </option>
                        ))}
                    </select> */}

                    {/* Menu yang dapat diakses */}
                    <ul className="menu menu-horizontal p-0 lg:flex">
                        {accessibleMenuItems.length > 0 ? accessibleMenuItems.map(renderMenu) : <li>Tidak ada menu yang tersedia</li>}
                    </ul>

                    {/* Icon keranjang */}
                    <button onClick={toggleCartModal} className="btn btn-ghost">
                        <i className="fa fa-cart-plus text-lg"></i>
                        <span className="indicator-item badge badge-secondary text-white">{Array.isArray(cartItems) ? cartItems.length : 0}</span>
                    </button>
                     {/* Floating Profile Button */}
                     
    <div className="menu menu-horizontal p-0 lg:flex">
      {/* Ikon gear dengan efek melayang dan warna */}
      <button className="btn btn-ghost" onClick={toggleProfileModal}><i className="fa fa-gear text-lg"></i>
      </button>
     
    </div>
  


                    {/* Left Sidebar Profile */}
                    {isProfileModalOpen && (
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                right: 0,
                                width: '300px', // Sidebar width
                                height: '60vh',
                                backgroundColor: '#fff',
                                boxShadow: '2px 0px 10px rgba(0, 0, 0, 0.2)', // Adding a subtle shadow
                                zIndex: 1001,
                                padding: '20px',
                                transition: 'transform 0.3s ease-in-out',
                                transform: isProfileModalOpen ? 'translateX(0)' : 'translateX(-100%)', // Slide in/out effect
                            }}
                        >
                            <h3 className="text-lg text-black font-bold mb-4">User Menu</h3>

                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li>
                                    <Link to="/profile" className="flex items-center text-black justify-start">
                                        <i className="fa fa-users mr-2" aria-hidden="true" style={{ color: 'red' }}></i>
                                        Profile
                                    </Link>
                                </li>
                                <li className="mt-2">
                                    <Link to="/setting" className="flex items-center text-black justify-start">
                                        <i className="fa fa-gear mr-2" aria-hidden="true" style={{ color: 'red' }}></i>
                                        Settings
                                    </Link>
                                </li>
                                <li className="mt-2">
                                    <Logout />
                                </li>
                            </ul>
                            <button
                                className="btn mt-4"
                                onClick={toggleProfileModal}
                            >
                                Close
                            </button>
                        </div>
                    )}


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
                                <div className="divider divider-primary">                                <h3 className="font-bold text-lg text-black">Keranjang Pesanan</h3>
                                </div>

                                {Array.isArray(cartItems) && cartItems.length > 0 ? (
                                    <div className="grid grid-cols-1  gap-4">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center border p-4 text-black">
                                                <div>
                                                    <Link to={`/order/${item.id}`}>
                                                        <span>Order ID: {item.id}</span> <br />
                                                        <span>Total Price: Rp {item.total_price.toLocaleString()}</span> <br />
                                                        <span>Status: <div className="badge badge-warning badge-outline">{item.payment_status}</div></span>
                                                    </Link>
                                                </div>
                                                <div className="flex flex-col justify-between h-full">
                                                    <button
                                                        className="btn btn-outline btn-primary" // Tambahkan margin bawah untuk memberi jarak
                                                        onClick={() => handleDeleteOrder(item.id)}>
                                                        <i className="fa fa-trash"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline btn-success"
                                                        onClick={() => handlePayment(item.id)}

                                                    >

                                                        <i className="fa fa-money"></i>
                                                    </button>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                                        <img src="./empty-cart.png" width="200" alt="Empty Cart" />
                                    </div>

                                )}


                                {Array.isArray(cartItems) && cartItems.length > 0 && (
                                    <button
                                        className="btn btn-danger mt-4"
                                        onClick={handleBulkDelete}>
                                        <i className="fa fa-trash"></i>

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
