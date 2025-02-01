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
        setLoading(true);
        try {
            const [usersRes, pdfRes, materialsRes] = await Promise.all([
                axios.get('/users'),
                axios.get('/pdf_statuses'),
                axios.get('/materials')
            ]);

            setUsers(usersRes.data || []);
            setPdfStatuses(pdfRes.data || []);
            setMaterials(materialsRes.data || []);
            setFilteredUsers(usersRes.data || []);
        } catch (error) {
            toast.error('Failed to fetch data.');
        } finally {
            setLoading(false);
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
            <h2 className="text-2xl font-bold mb-4">Materi dan Status Bacaan</h2>
            <input
                type="text"
                placeholder="Search by name or username"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="input input-bordered mb-4 w-full"
            />
            <DataTable
                columns={columns}
                data={filteredUsers}
                progressPending={loading}
                pagination
                className="rounded-lg shadow-lg bg-white"
            />
        </div>
    );
};

export default MergedPage;
