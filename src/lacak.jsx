import React, { useEffect, useState } from 'react';
import axios from './axiosInstance';
import DataTable from 'react-data-table-component';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MergedPage = () => {
    const [users, setUsers] = useState([]);
    const [pdfStatuses, setPdfStatuses] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (Array.isArray(users)) {
            const result = users.filter(user =>
                user?.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
                user?.username?.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredUsers(result);
        }
    }, [searchText, users]);

    const fetchData = async () => {
        try {
            const [pdfResponse, userResponse, materialResponse] = await Promise.all([
                axios.get('/pdf_statuses'),
                axios.get('/users'),
                axios.get('/materials')
            ]);
    
            console.log("PDF Statuses:", pdfResponse.data);
            console.log("Users:", userResponse.data);
            console.log("Materials:", materialResponse.data);
    
            // Pastikan hanya menyimpan array yang benar
            setPdfStatuses(Array.isArray(pdfResponse.data) ? pdfResponse.data : []);
            setUsers(Array.isArray(userResponse.data) ? userResponse.data : []);
            setMaterials(Array.isArray(materialResponse.data.materials) ? materialResponse.data.materials : []);
    
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    

    const columns = [
        { name: 'Nama', selector: row => row.first_name, sortable: true },
        { name: 'Username', selector: row => row.username, sortable: true },
        ...materials.map(material => ({
            name: material.title,
            cell: row => {
                const userPdf = pdfStatuses.find(pdf => pdf.username === row.username && pdf.pdf_url === material.content);
                return userPdf ? (
                    <a href={userPdf.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                        View PDF
                    </a>
                ) : 'Belum Dibaca';
            },
            ignoreRowClick: true,
            allowOverflow: true,
        }))
    ];

    return (
        <div className="container mx-auto p-4 bg-white text-black">
            <ToastContainer />
            
            {/* Bagian Judul Materi */}
            <h2 className="text-2xl font-bold mb-4">Tracking Pembaca Materi</h2>
            <div className="flex gap-4 overflow-x-auto mb-4 p-2 bg-gray-200 rounded-lg">
                {materials.length > 0 ? (
                    materials.map(material => (
                        <div key={material.id} className="p-2 bg-blue-500 text-white rounded-lg">
                            {material.title}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">Tidak ada materi tersedia</p>
                )}
            </div>

            {/* Tabel Pembaca Materi */}
            <DataTable
                columns={columns}
                data={pdfStatuses}
                progressPending={loading}
                pagination
                className="rounded-lg shadow-lg bg-white"
            />
        </div>
    );
};

export default MergedPage;
