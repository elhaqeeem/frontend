import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; // Pastikan path ini benar

function Dashboard() {
    const [courses, setCourses] = useState([]);

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

    return (
        <div className="flex min-h-screen">
            {/* Main Content */}
            <div className="flex-1 p-6 bg-gray-100">
              
                {/* Carousel Section */}
                {courses.length > 0 ? (
                    <div className="carousel w-full mt-8">
                        {courses.map((course, index) => (
                            <div id={`slide${index}`} key={course.id} className="carousel-item relative w-full">
                                <img src={course.imageUrl} alt={course.title} className="w-full object-cover h-64" />
                                <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
                                    <h2 className="text-2xl font-bold">{course.title}</h2>
                                    <p>{course.description}</p>
                                </div>
                                <div className="absolute flex justify-between w-full top-1/2 transform -translate-y-1/2">
                                    <a href={`#slide${index === 0 ? courses.length - 1 : index - 1}`} className="btn btn-circle">❮</a>
                                    <a href={`#slide${(index + 1) % courses.length}`} className="btn btn-circle">❯</a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Loading courses...</p>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
