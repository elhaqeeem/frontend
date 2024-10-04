import React, { useEffect, useState, useMemo } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';

const TestItemManager = () => {
    const [testItems, setTestItems] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [testItemData, setTestItemData] = useState({
        kraeplin_test_id: '',
        deret_angka: [],
        sequence_number: '',
        column_number: '',
        answer: ''
    });
    const [selectedTestItem, setSelectedTestItem] = useState(null);
    const [bulkText, setBulkText] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        fetchTestItems();
    }, []);

    const fetchTestItems = async () => {
        try {
            const response = await axios.get('/testitems');
            setTestItems(response.data || []);
        } catch (error) {
            toast.error('Failed to fetch test items.');
            console.error('Error fetching test items:', error);
        }
    };

    const filteredTestItems = useMemo(() => {
        return testItems.filter((item) => {
            const deretAngka = item.deret_angka ? item.deret_angka.join(', ') : '';
            return deretAngka.toLowerCase().includes(search.toLowerCase());
        });
    }, [search, testItems]);

    const saveTestItem = async () => {
        const { kraeplin_test_id, deret_angka, sequence_number, column_number, answer } = testItemData;
        const kraeplinTestIDInt = parseInt(kraeplin_test_id, 10);

        // Ensure deret_angka is an array of integers
        if (!Array.isArray(deret_angka) || deret_angka.some(num => isNaN(num))) {
            toast.error('Deret Angka harus berupa array.');
            return;
        }

        if (!kraeplinTestIDInt || isNaN(kraeplinTestIDInt) || !deret_angka.length || !sequence_number || !column_number || !answer) {
            toast.error('All fields are required.');
            return;
        }

        const dataToSend = {
            kraeplin_test_id: kraeplinTestIDInt,
            deret_angka,
            sequence_number,
            column_number,
            answer
        };

        try {
            if (selectedTestItem) {
                // Update test item
                await axios.put(`/testitem/${selectedTestItem.item_id}`, dataToSend);
                toast.success('Test item updated successfully.');
            } else {
                // Add new test item
                await axios.post('/testitem', dataToSend);
                toast.success('Test item created successfully.');
            }
            fetchTestItems();  // Fetch latest data after saving
            resetForm();  // Reset form after saving
        } catch (error) {
            toast.error('Failed to save test item.');
            console.error('Error saving test item:', error);
        }
    };

    const handleEdit = (item) => {
        setSelectedTestItem(item);
        setTestItemData({
            kraeplin_test_id: item.kraeplin_test_id,
            deret_angka: Array.isArray(item.deret_angka) ? item.deret_angka : JSON.parse(item.deret_angka), // Convert to array
            sequence_number: item.sequence_number,
            column_number: item.column_number,
            answer: item.answer,
        });
        setIsModalOpen(true); // Open modal for editing
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to delete this test item!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/testitem/${id}`);
                toast.success('Test item deleted successfully.');
                fetchTestItems();
            } catch (error) {
                toast.error('Failed to delete test item.');
                console.error('Error deleting test item:', error);
            }
        }
    };

    const resetForm = () => {
        setSelectedTestItem(null);
        setTestItemData({
            kraeplin_test_id: '',
            deret_angka: [],
            sequence_number: '',
            column_number: '',
            answer: ''
        });
        setIsModalOpen(false);
    };

    const handleBulkImport = async () => {
        if (!bulkText) {
            toast.error('Please enter text to import.');
            return;
        }

        const textArray = bulkText.split('\n').filter((line) => line.trim());
        const testItemsArray = textArray.map((line) => {
            const parts = line.split(',').map((part) => part.trim());
            return {
                kraeplin_test_id: Number(parts[0]),
                deret_angka: JSON.parse(parts[1]), // Parse as array
                sequence_number: parts[2],
                column_number: parts[3],
                answer: parts[4],
            };
        });

        try {
            await axios.post('/test-items/bulk-import-text', { testItems: testItemsArray });
            toast.success('Test items imported successfully.');
            fetchTestItems();
        } catch (error) {
            toast.error('Failed to import test items.');
            console.error('Error importing test items:', error);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRows.length === 0) {
            toast.error('Please select at least one test item to delete.');
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete ${selectedRows.length} test item(s)!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete them!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete('/test-items/bulk', {
                    data: { ids: selectedRows.map(row => row.item_id) },
                });
                toast.success('Selected test items deleted successfully.');
                fetchTestItems();
            } catch (error) {
                toast.error('Failed to delete selected test items.');
                console.error('Error bulk deleting test items:', error);
            }
        }
    };

    const columns = [
        {
            name: 'Item ID',
            selector: (row) => row.item_id,
            sortable: true,
        },
        {
            name: 'Test ID',
            selector: (row) => row.kraeplin_test_id,
            sortable: true,
        },
        {
            name: 'Deret Angka',
            selector: (row) => row.deret_angka.join(', '), // Display deret angka as string
            sortable: true,
        },
        {
            name: 'Sequence Number',
            selector: (row) => row.sequence_number,
            sortable: true,
        },
        {
            name: 'Column Number',
            selector: (row) => row.column_number,
            sortable: true,
        },
        {
            name: 'Answer',
            selector: (row) => row.answer,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="flex space-x-2">
                    <button className="btn btn-outline btn-primary" onClick={() => handleEdit(row)}>
                        Edit
                    </button>
                    <button className="btn btn-outline btn-error" onClick={() => handleDelete(row.item_id)}>
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="container mx-auto p-4">
            <ToastContainer />
            <div className="flex justify-between items-center mb-4">
                <button className="btn btn-outline btn-primary" onClick={() => setIsModalOpen(true)}>
                    Add Test Item
                </button>

                <button className="btn btn-outline btn-success" onClick={() => setBulkText('')}>
                    Bulk Import
                </button>
                <button
                    className="btn btn-outline btn-danger"
                    onClick={handleBulkDelete}
                    disabled={selectedRows.length === 0}
                >
                    Delete Selected
                </button>
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input input-bordered"
                />
            </div>
            <DataTable
                columns={columns}
                data={filteredTestItems}
                selectableRows
                onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
                pagination
            />
            {/* Add/Edit Test Item Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="modal-box bg-white p-6 rounded">
                        <h2 className="text-lg font-bold">{selectedTestItem ? 'Edit' : 'Add'} Test Item</h2>
                        <div className="mt-4">
                            <input
                                type="number"
                                placeholder="Kraeplin Test ID"
                                value={testItemData.kraeplin_test_id}
                                onChange={(e) => setTestItemData({ ...testItemData, kraeplin_test_id: e.target.value })}
                                className="input input-bordered mb-2"
                            />
                            <input
                                type="text"
                                placeholder="Deret Angka (comma separated)"
                                value={testItemData.deret_angka.join(', ')}
                                onChange={(e) => setTestItemData({
                                    ...testItemData,
                                    deret_angka: e.target.value.split(',').map(Number) // Convert to array of numbers
                                })}
                                className="input input-bordered mb-2"
                            />
                            <input
                                type="text"
                                placeholder="Sequence Number"
                                value={testItemData.sequence_number}
                                onChange={(e) => setTestItemData({ ...testItemData, sequence_number: e.target.value })}
                                className="input input-bordered mb-2"
                            />
                            <input
                                type="text"
                                placeholder="Column Number"
                                value={testItemData.column_number}
                                onChange={(e) => setTestItemData({ ...testItemData, column_number: e.target.value })}
                                className="input input-bordered mb-2"
                            />
                            <input
                                type="text"
                                placeholder="Answer"
                                value={testItemData.answer}
                                onChange={(e) => setTestItemData({ ...testItemData, answer: e.target.value })}
                                className="input input-bordered mb-4"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button className="btn btn-outline" onClick={resetForm}>
                                Cancel
                            </button>
                            <button className="btn btn-primary ml-2" onClick={saveTestItem}>
                                {selectedTestItem ? 'Update' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Bulk Import Modal */}
            <div className={`modal ${bulkText ? 'modal-open' : ''}`}>
                <div className="modal-box">
                    <h2 className="text-lg font-bold">Bulk Import Test Items</h2>
                    <textarea
                        placeholder="Enter test items in format: kraeplin_test_id, [deret_angka], sequence_number, column_number, answer"
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        className="textarea textarea-bordered h-32 mb-4"
                    />
                    <div className="flex justify-end">
                        <button className="btn btn-outline" onClick={() => setBulkText('')}>Cancel</button>
                        <button className="btn btn-primary ml-2" onClick={handleBulkImport}>Import</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestItemManager;
