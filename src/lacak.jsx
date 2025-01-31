import React, { useEffect, useState } from 'react';
import axios from './axiosInstance';
import DataTable from 'react-data-table-component';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RankingPage = () => {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filteredRankings, setFilteredRankings] = useState([]);

    useEffect(() => {
        fetchRankings();
    }, []);

    useEffect(() => {
        if (Array.isArray(rankings)) {
            const result = rankings.filter(item => 
                item?.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
                item?.username?.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredRankings(result);
        }
    }, [searchText, rankings]);

    const fetchRankings = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/pdf_statuses');
            setRankings(response.data || []);
            setFilteredRankings(response.data || []);
        } catch (error) {
            toast.error('Failed to fetch rankings.');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { name: 'Ranking', selector: (row, index) => index + 1, sortable: true },
        { name: 'Nama', selector: row => row.first_name, sortable: true },
        { name: 'Username', selector: row => row.username, sortable: true },
        {
            name: 'PDF',
            cell: row => (
                <a href={row.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                    View PDF
                </a>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
        },
        { name: 'Created At', selector: row => new Date(row.created_at).toLocaleString(), sortable: true }
    ];

    return (
        <div className="container mx-auto p-4 bg-white text-black">
            <ToastContainer />
            <h2 className="text-2xl font-bold mb-4">Ranking List</h2>
            <input
                type="text"
                placeholder="Search by name or username"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="input input-bordered mb-4 w-full"
            />
            <DataTable
                columns={columns}
                data={filteredRankings}
                progressPending={loading}
                pagination
                className="rounded-lg shadow-lg bg-white"
            />
        </div>
    );
};

export default RankingPage;
