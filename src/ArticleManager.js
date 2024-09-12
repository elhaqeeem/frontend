import React, { useEffect, useState, useRef } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import Swal from 'sweetalert2';

const ArticleManager = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articleData, setArticleData] = useState({
    title: '',
    content: '',
    id: '',
    tags: '',
  });
  const [selectedRows, setSelectedRows] = useState([]); // State for selected rows
  const [selectAll, setSelectAll] = useState(false); // State for select all checkbox
  const userId = 1; // Simulated logged-in user ID
  const quillRef = useRef(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    setFilteredArticles(
      articles.filter((article) =>
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.content.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, articles]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get('/articles');
      setArticles(response.data.articles || []);
    } catch (error) {
      toast.error('Failed to fetch articles.');
    }
  };

  const handleCreateOrUpdate = async () => {
    const { title, content, id, tags } = articleData;

    if (!title || !content) {
      toast.error('Title and content are required.');
      return;
    }

    const articlePayload = { title, content, tags, author_id: userId };

    const confirmationText = id ? 'update this article!' : 'create a new article!';
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to ${confirmationText}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      try {
        id
          ? await axios.put(`/articles/${id}`, articlePayload)
          : await axios.post('/articles', articlePayload);

        toast.success(`Article ${id ? 'updated' : 'created'} successfully.`);
        fetchArticles();
        resetForm();
      } catch (error) {
        toast.error(`Failed to ${id ? 'update' : 'create'} article.`);
      }
    }
  };

  const handleEdit = (article) => {
    setArticleData({
      title: article.title,
      content: article.content,
      id: article.id,
      tags: article.tags,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this article!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/articles/${id}`);
        toast.success('Article deleted successfully.');
        fetchArticles();
      } catch (error) {
        toast.error('Failed to delete article.');
      }
    }
  };

  const resetForm = () => {
    setArticleData({ title: '', content: '', id: '', tags: '' });
    setIsModalOpen(false);
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.error('No articles selected for deletion.');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedRows.length} article(s)!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete('/articles/bulk-delete', {
          data: { ids: selectedRows }, // Send selected article IDs
        });
        toast.success('Selected articles deleted successfully.');
        fetchArticles(); // Refresh the data
        setSelectedRows([]); // Clear selected rows
        setSelectAll(false); // Reset select all state
      } catch (error) {
        toast.error('Failed to delete selected articles.');
        console.error('Error bulk deleting articles:', error);
      }
    }
  };

  const columns = [
    {
      name: 'Select',
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.id)}
          onChange={() => {
            setSelectedRows((prevSelected) => {
              if (prevSelected.includes(row.id)) {
                return prevSelected.filter((id) => id !== row.id);
              } else {
                return [...prevSelected, row.id];
              }
            });
          }}
        />
      ),
      width: '100px', // Optional: set a fixed width for the checkbox column
    },
    {
      name: 'Title',
      selector: (row) => row.title,
      sortable: true,
    },
    {
      name: 'Author',
      selector: (row) => row.author_id,
      sortable: true,
    },
    {
      name: 'Tags',
      selector: (row) => row.tags,
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <button className="btn btn-outline btn-primary" onClick={() => handleEdit(row)}>
            <i className="fa fa-pencil" aria-hidden="true"></i>
          </button>
          <button className="btn btn-outline btn-error" onClick={() => handleDelete(row.id)}>
            <i className="fa fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4 bg-white text-black">
      <ToastContainer position="top-right" />
      <div className="flex justify-between items-center mb-4">
        <button className="btn btn-outline btn-primary" onClick={() => setIsModalOpen(true)}>
          Add Article
        </button>
        <button className="btn btn-outline btn-danger" onClick={handleBulkDelete}>
          Bulk Delete
        </button>
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full max-w-xs pl-10"
          />
          <i className="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      <DataTable
        title="Article List"
        columns={[
          {
            name: 'Select All',
            cell: () => (
              <input
                type="checkbox"
                checked={selectAll}
                onChange={() => {
                  const newSelectedRows = selectAll ? [] : filteredArticles.map((article) => article.id);
                  setSelectedRows(newSelectedRows);
                  setSelectAll(!selectAll);
                }}
              />
            ),
            width: '100px',
          },
          ...columns, // Spread the existing columns
        ]}
        data={filteredArticles}
        noDataComponent="No articles available"
        pagination
        className="rounded-lg shadow-lg bg-white"
      />

      {isModalOpen && (
        <div className="modal modal-open bg-dark text-black">
          <div className="modal-box max-w-lg mx-auto">
            <h2 className="font-bold text-lg">
              {articleData.id ? 'Edit Article' : 'Add Article'}
            </h2>
            <input
              type="text"
              placeholder="Article Title"
              value={articleData.title}
              onChange={(e) => setArticleData({ ...articleData, title: e.target.value })}
              className="input input-bordered w-full mb-2"
              required
            />
            <input
              type="text"
              placeholder="Article Tags"
              value={articleData.tags}
              onChange={(e) => setArticleData({ ...articleData, tags: e.target.value })}
              className="input input-bordered w-full mb-2"
              required
            />
            <ReactQuill
              ref={quillRef}
              value={articleData.content}
              onChange={(content) => setArticleData({ ...articleData, content })}
              className="mb-4"
            />
            <div className="modal-action">
              <button className="btn" onClick={resetForm}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateOrUpdate}>
                {articleData.id ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleManager;
