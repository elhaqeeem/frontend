import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; // Ganti dengan path axiosInstance yang benar
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CloudinaryContext } from 'cloudinary-react'; // Import CloudinaryContext

const Materialsdata = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contentUrl, setContentUrl] = useState(null); // State for content URL

    useEffect(() => {
        const fetchMaterials = async () => {
            setLoading(true);
            const token = localStorage.getItem('token'); // Ambil token dari local storage

            try {
                const response = await axios.get('/materials', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Menggunakan Bearer token
                    },
                });
                setMaterials(response.data.materials);

                // Set the contentUrl to the content of the first material as an example
                if (response.data.materials.length > 0) {
                    setContentUrl(response.data.materials[0].content); // Set content URL from first material
                }
            } catch (error) {
                console.error('Error fetching materials:', error);
                toast.error('Failed to fetch materials.');
            } finally {
                setLoading(false);
            }
        };

        fetchMaterials();
    }, []);

    const fetchContent = async (material) => {
        const token = localStorage.getItem('token'); // Get token
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    
        try {
            const response = await axios.get(material.content, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the request
                    'Cloud-Name': cloudName, // Optional: Remove this if unnecessary
                },
            });
            setContentUrl(material.content);
        } catch (error) {
            console.error('Error fetching content:', error);
            toast.error('Failed to fetch content.');
        }
    };
    

    if (loading) return <p>Loading...</p>; // Menampilkan loading indicator

    return (
        <CloudinaryContext cloudName={process.env.REACT_APP_CLOUD_NAME}>
            <div className="flex flex-col items-center min-h-screen bg-base-200 p-4">
                <ToastContainer />
                <h2 className="text-2xl font-bold mb-4">Materials</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {materials.map((material) => (
                        <div key={material.id} className="card card-compact bg-base-50 w-50 shadow-xl">
                            <h2 className="accordion-header">
                                <button
                                    className="accordion-button"
                                    data-accordion-target={`#accordion-collapse-${material.id}`}
                                    aria-expanded="false"
                                    aria-controls={`accordion-collapse-${material.id}`}
                                    onClick={() => fetchContent(material)} // Fetch content on click
                                >
                                    {material.title}
                                </button>
                            </h2>
                            <div id={`accordion-collapse-${material.id}`} className="accordion-body collapse">
                                {/* Check if contentUrl is set */}
                                {contentUrl ? (
    contentUrl.endsWith('.pdf') ? (
        <>
            {/* Log the contentUrl and material details */}
            {console.log('Loading PDF content:', contentUrl)}
            {console.log('Material context:', material)}

            <iframe
                src={contentUrl} // Use the content URL from state
                width="auto"
                height="500px"
                title={material.title}
                className="border border-gray-300"
            >
                This browser does not support PDFs. Please download the PDF to view it: <a href={contentUrl}>Download PDF</a>
            </iframe>
        </>
    ) : (
        <>
            {/* Log unsupported content type */}
            {console.log('Unsupported content type for:', contentUrl)}
            <p>Unsupported content type</p>
        </>
    )
) : (
    <>
        {/* Log when no content is available */}
        {console.log('No content available for this material:', material)}
        <p>No content available</p>
    </>
)}

                                <p>Created At: {new Date(material.created_at).toLocaleString()}</p>
                                <p>Updated At: {new Date(material.updated_at).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </CloudinaryContext>
    );
};

export default Materialsdata;
