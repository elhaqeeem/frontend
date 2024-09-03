import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; // Ensure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

const ArticleManager = () => {
  const [articles, setArticles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleId, setArticleId] = useState('');
    // eslint-disable-next-line
  const [userId, setUserId] = useState(1); // Simulated logged-in user ID

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get('/articles');
      setArticles(response.data.articles || []);
    } catch (error) {
      toast.error('Failed to fetch articles.');
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!articleTitle || !articleContent) {
      toast.error('Title and content are required.');
      return;
    }

    const articleData = {
      title: articleTitle,
      content: articleContent,
      author_id: userId,
    };

    try {
      if (selectedArticle) {
        await axios.put(`/articles/${articleId}`, articleData);
        toast.success('Article updated successfully.');
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
    try {
      await axios.delete(`/articles/${id}`);
      toast.success('Article deleted successfully.');
      fetchArticles();
    } catch (error) {
      toast.error('Failed to delete article.');
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
    <div className="container mx-auto p-4">
      <ToastContainer />
      <button className="btn btn-outline btn-primary mb-4" onClick={() => setIsModalOpen(true)}>
        Add Article
      </button>

      <DataTable
        title="Article List"
        columns={columns}
        data={articles}
        noDataComponent="No articles available"
        pagination
      />

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg mx-auto"> {/* Adjusted size */}
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
              modules={{ toolbar: toolbarOptions }} // Apply custom toolbar
              placeholder="Write your article content here..."
              className="mb-2"
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
