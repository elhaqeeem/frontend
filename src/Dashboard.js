import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import stylesheet toastify
import axios from './axiosInstance'; // Pastikan path ini benar
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import stylesheet ReactQuill
import { AdvancedImage } from '@cloudinary/react'; // Import AdvancedImage
import { Cloudinary } from '@cloudinary/url-gen'; // Import Cloudinary for image configuration
import { scale } from '@cloudinary/url-gen/actions/resize'; // Import action for resizing
import { quality, format } from '@cloudinary/url-gen/actions/delivery'; // Import actions for quality and format

function Dashboard() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderStatus, setOrderStatus] = useState(null); // State untuk status order
    const [isLoading, setIsLoading] = useState(false); // State untuk loading saat order

    // Komponen Card
    const Card = ({ title, description, discount }) => {
        return (
            <div style={styles.card}>
                <div style={styles.watermark}>{discount}% OFF</div>
                <div style={styles.cardContent}>
                    <h3>{title}</h3>
                    <p>{description}</p>
                </div>
            </div>
        );
    };

    // Gaya untuk Card
    const styles = {
        card: {
            position: 'relative',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '20px',
            margin: '20px',
        },
        cardContent: {
            padding: '10px',
        },
        watermark: {
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(255, 0, 0, 0.7)', // Warna latar belakang
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '14px',
            transform: 'rotate(-15deg)', // Memutar watermark
        },
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // Function to fetch courses from the API
    const fetchCourses = async () => {
        try {
            const response = await axios.get('/courses'); // Endpoint API untuk mendapatkan courses
            setCourses(response.data.courses || []);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    // Function to handle "Learn More" button click
    const handleLearnMore = (course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
        setOrderStatus(null); // Reset order status
    };

    // Function to close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    // Function to handle order creation
    const handleOrder = async () => {
        if (!selectedCourse) return;

        const userId = localStorage.getItem('id'); // Ambil dari localStorage

        if (!userId) {
            toast.error('User not found. Please login first.');
            return;
        }

        const orderData = {
            user_id: parseInt(userId), // Pastikan user_id di-convert menjadi integer
            course_id: selectedCourse.id,
            order_date: new Date(),
            payment_status: 'pending', // Status pembayaran yang sesuai
            total_price: selectedCourse.harga, // Pastikan course memiliki properti 'harga'
            payment_method: 'credit_card', // Metode pembayaran yang sesuai
        };

        if (orderData.total_price <= 0) {
            toast.error('Total price must be greater than zero.');
            return;
        }

        try {
            setIsLoading(true); // eslint-disable-next-line
            const response = await axios.post('/orders', orderData);
            toast.success('Order created successfully!');
        } catch (error) {
            console.error('Failed to create order:', error);
            if (error.response) {
                if (error.response.status === 400) {
                    toast.error('Bad Request: Invalid data.');
                } else if (error.response.status === 500) {
                    toast.error('Server Error: Please try again later.');
                } else {
                    toast.error('Failed to create order. Please try again.');
                }
            } else {
                toast.error('Network error. Please check your connection.');
            }
        } finally {
            setIsLoading(false); // Selesai loading
        }
    };

    // Konfigurasi Cloudinary
    const cld = new Cloudinary({
        cloud: {
            cloudName: 'db8atpjwp', // Ganti dengan cloud name Anda
        },
    });

    return (
        <div className="flex min-h-screen">
            {/* ToastContainer for notifications */}
            <ToastContainer />

            {/* Main Content */}

            <div className="flex-1 p-6 bg-white-100">
                <div className="divider divider-secondary"><strong><h1>Courses</h1></strong></div>

                {/* Courses Section */}
                {courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => {
                            // Gunakan public ID dari path_image untuk membuat gambar
                            const publicId = course.path_image.split('/').slice(-2).join('/'); // Ambil public ID
                            const myImage = cld.image(publicId); // Ambil path_image dari API (hanya public ID)

                            myImage
                                .resize(scale().width(1000)) // Resize gambar sesuai kebutuhan
                                .delivery(quality('auto')) // Optimasi kualitas otomatis
                                .delivery(format('auto')); // Pilih format gambar otomatis

                            return (
                                <div key={course.id} className="card card-compact bg-base-50 w-50 shadow-xl">
                                    {course.discount > 0 && (
                                        <div style={styles.watermark}>
                                            Disc: {course.discount}%
                                        </div>
                                    )}


                                    <figure>
                                        {/* Tampilkan gambar yang sudah di-resize menggunakan AdvancedImage */}
                                        <AdvancedImage
                                            cldImg={myImage}
                                            alt={course.title}
                                            className="object-cover h-64 w-full"
                                        />
                                    </figure>

                                    <div className="card-body bg-white">
                                        <h2 className="card-title">{course.title}</h2>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <button className="btn btn-outline btn-secondary text-white">
                                                Rp. {Number(course.harga - (course.harga * (course.discount / 100))).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }).replace('Rp', '')}
                                                {/* Tampilkan harga setelah diskon */}
                                                {course.discount > 0 && (
                                                <span className="line-through ml-2 text-gray-500">
                                                    Rp. {Number(course.harga).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }).replace('Rp', '')}

                                               
                                                </span>
                                            )}
                                                </button>
                                               
                                            </div>
                                            <button
                                                className="btn btn-circle btn-accent"
                                                onClick={() => handleLearnMore(course)}
                                            >
                                                <i className="fa fa-cart-plus" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            );
                        })}
                    </div>
                ) : (
                    <p>Loading courses...</p>
                )}
            </div>

            {/* Modal Section */}
            {isModalOpen && selectedCourse && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-3xl p-6 rounded-lg shadow-lg relative">
                        <button
                            className="absolute top-2 right-2 btn btn-sm btn-circle"
                            onClick={closeModal}
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl font-bold mb-4">{selectedCourse.title}</h2>

                        {/* Scrollable container for ReactQuill */}
                        <div className="quill-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <ReactQuill
                                value={selectedCourse.description} // Assuming 'description' contains the full course description
                                readOnly={true}
                                theme="bubble"
                            />
                        </div>

                        {/* Icon Keranjang dan Tombol Pesan */}
                        <div className="flex items-center justify-end mt-4">
                            <button
                                className="btn btn-primary mr-2"
                                onClick={handleOrder}
                                disabled={isLoading} // Disabled saat loading
                            >
                                {isLoading ? 'Processing...' : (
                                    <>
                                        <i className="fas fa-shopping-cart"></i> {/* Ganti dengan ikon keranjang yang sesuai */}
                                        Buy Now
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Tampilkan status order */}
                        {orderStatus && (
                            <div className="mt-4 text-center">
                                <p className={`text-${orderStatus.includes('success') ? 'green' : 'red'}-500`}>{orderStatus}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
