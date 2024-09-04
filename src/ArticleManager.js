import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; // Pastikan path ini benar
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Swal from 'sweetalert2';

const ArticleManager = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]); // Menyimpan hasil pencarian
  const [search, setSearch] = useState(''); // State untuk input pencarian
  const [roles, setRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleId, setArticleId] = useState('');
  const [userId, setUserId] = useState(1); // Simulated logged-in user ID

  useEffect(() => {
    const fetchRolesAndArticles = async () => {
      await fetchRoles(); 
      await fetchArticles(); 
    };
    fetchRolesAndArticles();
  }, []);

  useEffect(() => {
    const result = articles.filter(article =>
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.role_name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredArticles(result);
  }, [search, articles]); // Efek untuk memfilter data saat input pencarian berubah

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/roles');
      setRoles(response.data.roles || []);
    } catch (error) {
      toast.error('Failed to fetch roles.');
    }
  };

  const fetchArticles = async () => {
    try {
      const response = await axios.get('/articles');
      const articlesWithRoleNames = response.data.articles.map((article) => {
        const role = roles.find((role) => role.ID === article.author_id);
        return {
          ...article,
          role_name: role ? role.RoleName : 'Unknown',
        };
      });
      setArticles(articlesWithRoleNames);
      setFilteredArticles(articlesWithRoleNames); // Inisialisasi hasil pencarian
    } catch (error) {
      toast.error('Failed to fetch articles.');
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!articleTitle || !articleContent) {
      toast.error('Title and content are required.');
      return;
    }

    if (articleContent.length > 65535) {
      toast.error('Content exceeds the maximum character limit of 65,535 characters.');
      return;
    }

    const articleData = {
      title: articleTitle,
      content: articleContent,
      author_id: userId,
    };

    try {
      if (selectedArticle) {
        const result = await Swal.fire({
          title: 'Are you sure?',
          text: 'You are about to update this article!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, update it!',
          cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
          await axios.put(`/articles/${articleId}`, articleData);
          toast.success('Article updated successfully.');
        }
      } else {
        await axios.post('/articles', articleData);
        toast.success('Article created successfully.');
      }
      fetchArticles();
      resetForm();
    } catch (error) {
      toast.error('Failed to save article.');
    }
  };

  const handleEdit = (article) => {
    setSelectedArticle(article);
    setArticleId(article.id);
    setArticleTitle(article.title);
    setArticleContent(article.content);
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
    setSelectedArticle(null);
    setArticleTitle('');
    setArticleContent('');
    setArticleId('');
    setIsModalOpen(false);
  };

  const columns = [
    {
      name: 'Title',
      selector: (row) => row.title,
      sortable: true,
    },
    {
      name: 'Author',
      selector: (row) => row.role_name, // Menampilkan role_name
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <button className="btn btn-outline btn-primary" onClick={() => handleEdit(row)}>
            Edit
          </button>
          <button className="btn btn-outline btn-error" onClick={() => handleDelete(row.id)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  const toolbarOptions = [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image', 'video'],
    ['clean'], // remove formatting button
  ];

  return (
    <div className="container mx-auto p-4 bg-white text-black">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <button className="btn btn-outline btn-primary" onClick={() => setIsModalOpen(true)}>
          Add Article
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
        columns={columns}
        data={filteredArticles}
        noDataComponent="No articles available"
        pagination
        className="rounded-lg shadow-lg bg-white"
      />

      {isModalOpen && (
        <div className="modal modal-open bg-dark text-white">
          <div className="modal-box max-w-lg mx-auto">
            <h2 className="font-bold text-lg">{selectedArticle ? 'Edit Article' : 'Add Article'}</h2>
            <input
              type="text"
              placeholder="Article Title"
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
              className="input input-bordered w-full mb-2"
              required
            />
            <ReactQuill
              value={articleContent}
              onChange={setArticleContent}
              modules={{ toolbar: toolbarOptions }}
              placeholder="Write your article content here..."
              className="mb-4 bg-white text-black"
            />
            <div className="modal-action">
              <button className="btn" onClick={handleCreateOrUpdate}>
                {selectedArticle ? 'Update' : 'Create'}
              </button>
              <button className="btn" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleManager;
