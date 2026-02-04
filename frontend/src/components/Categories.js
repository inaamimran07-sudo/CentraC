import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import Subcategories from './Subcategories';
import '../styles/Categories.css';

function Categories({ isAdmin, token, userId, onRefresh }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter out email categories from regular Categories section
      const regularCategories = response.data.filter(cat => 
        cat.name !== 'Corporation Tax Return Emails' && cat.name !== 'Self Assessment Emails'
      );
      setCategories(regularCategories);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      await axios.post(
        '/api/categories',
        { name: newCategoryName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCategories();
      setNewCategoryName('');
      setShowModal(false);
      onRefresh();
    } catch (err) {
      alert('Error creating category');
    }
  };

  const handleDeleteCategory = async (id) => {
    const firstConfirm = window.confirm('⚠️ WARNING: Delete this category and all its subcategories?\n\nThis action cannot be undone!');
    if (!firstConfirm) return;
    
    const secondConfirm = window.confirm('Are you absolutely sure? All data will be permanently deleted!');
    if (!secondConfirm) return;
    try {
      await axios.delete(`/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCategories();
      onRefresh();
    } catch (err) {
      alert('Error deleting category');
    }
  };

  if (loading) return <div className="loading">Loading categories...</div>;

  return (
    <div className="categories">
      <div className="section-header">
        <h2>Categories</h2>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="add-btn">
            + Add Category
          </button>
        )}
      </div>

      <div className="categories-list">
        {categories.map(category => (
          <div key={category.id} className="category-item">
            <div className="category-header">
              <button
                className="expand-btn"
                onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
              >
                {expandedCategory === category.id ? '▼' : '▶'} {category.name}
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              )}
            </div>

            {expandedCategory === category.id && (
              <div className="category-content">
                <Subcategories
                  categoryId={category.id}
                  token={token}
                  userId={userId}
                  onRefresh={onRefresh}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && isAdmin && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Category</h3>
            <form onSubmit={handleCreateCategory}>
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Corporation Tax Returns"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;
