import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; // Ganti dengan path axiosInstance yang benar
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CloudinaryContext } from 'cloudinary-react'; // Import CloudinaryContext
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css'; // React PDF viewer styles
import '@react-pdf-viewer/default-layout/lib/styles/index.css'; // Layout plugin styles
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the styles

const Materialsdata = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);// eslint-disable-next-line
    const [contentUrl, setContentUrl] = useState(null); // State for content URL
    const [openMaterialId, setOpenMaterialId] = useState(null); // Track which material is open
    const [materialContents, setMaterialContents] = useState({}); // eslint-disable-next-line
    const defaultLayoutPluginInstance = defaultLayoutPlugin(); // Initialize the layout plugin

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
       // const token = localStorage.getItem('token'); // Get token
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

        try {// eslint-disable-next-line
            const response = await axios.get(material.content, {
                headers: {
                    //Authorization: `Bearer ${token}`, // Include the token in the request
                    'Cloud-Name': cloudName, // Optional: Remove this if unnecessary
                },
            });
            setMaterialContents((prevContents) => ({
                ...prevContents,
                [material.id]: material.content, // Store the content for this specific material
            }));
                } catch (error) {
            console.error('Error fetching content:', error);
            toast.error('Failed to fetch content.');
        }
    };

    const handleAccordionClick = (material) => {
        if (openMaterialId === material.id) {
            setOpenMaterialId(null); // Close if clicked again
        } else {
            setOpenMaterialId(material.id); // Open the clicked accordion
            if (!materialContents[material.id]) {
                // Fetch content if not already fetched
                fetchContent(material);
            }
        }
    };

    if (loading) return <p>Loading...</p>; // Menampilkan loading indicator

    return (
        <CloudinaryContext cloudName={process.env.CLOUDINARY_CLOUD_NAME}>
        <div className="flex flex-col items-center min-h-screen bg-base-200 p-4">
            <ToastContainer />
            <h2 className="text-3xl font-bold mb-4">Materials</h2>

            <div className="w-full">
                <div className="grid grid-cols-1 gap-6">
                    {materials.map((material) => (
                       <div
                       className={`collapse collapse-arrow border border-base-300 bg-base-100 rounded-box ${openMaterialId === material.id ? 'collapse-open' : ''}`}
                   >
                       {/* Accordion Title */}
                       <div
                           className="collapse-title text-xl font-medium cursor-pointer" // tambahkan cursor-pointer untuk memberikan indikasi klik
                           onClick={() => handleAccordionClick(material)} // Handle accordion click
                       >
                           <ReactQuill
                               value={material.title}
                               readOnly={true} // Set the editor to read-only
                               theme="bubble" // Use a theme that fits better for read-only display
                               modules={{ toolbar: false }} // Disable the toolbar
                           />
                       </div>
                   
                       {/* Accordion Content */}
                       {openMaterialId === material.id && (
                           <div className="collapse-content">
                           {materialContents[material.id] ? (
                               materialContents[material.id].endsWith('.pdf') ? (
                                   <div className="pdf-viewer w-full h-[80vh]"> {/* Adjust height for desktop */}
                                       <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                                           <Viewer
                                               fileUrl={materialContents[material.id]} // Load specific material content
                                               // Hilangkan plugin untuk menghapus toolbar
                                           />
                                       </Worker>
                                   </div>
                               ) : (
                                   <p>Unsupported content type</p>
                               )
                           ) : (
                               <p>Loading content...</p>
                           )}
                       
                          
                       </div>
                       
                       )}
                   </div>
                   
                    ))}
                </div>
            </div>
        </div>
    </CloudinaryContext>

    );
};

export default Materialsdata;