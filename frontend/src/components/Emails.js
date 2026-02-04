import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import Subcategories from './Subcategories';
import '../styles/Categories.css';

function Emails({ isAdmin, token, userId, onRefresh }) {
  const [selectedCategory, setSelectedCategory] = useState('Corporation Tax Return Emails');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter to only email categories
      const emailCategories = response.data.filter(cat => 
        cat.name === 'Corporation Tax Return Emails' || cat.name === 'Self Assessment Emails'
      );
      setCategories(emailCategories);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setLoading(false);
    }
  };

  const getCategory = (name) => {
    return categories.find(cat => cat.name === name);
  };

  return (
    <div
      className="categories"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/centra-logo.png)`,
        backgroundSize: '300px 300px',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="section-header">
        <h2>Email Categories</h2>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="categories-tabs">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-tab ${selectedCategory === cat.name ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.name)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="categories-content">
            {selectedCategory === 'Corporation Tax Return Emails' && getCategory('Corporation Tax Return Emails') && (
              <Subcategories
                categoryId={getCategory('Corporation Tax Return Emails').id}
                categoryName="Corporation Tax Return Emails"
                isAdmin={isAdmin}
                token={token}
                userId={userId}
                onRefresh={onRefresh}
                isEmailCategory={true}
              />
            )}
            {selectedCategory === 'Self Assessment Emails' && getCategory('Self Assessment Emails') && (
              <Subcategories
                categoryId={getCategory('Self Assessment Emails').id}
                categoryName="Self Assessment Emails"
                isAdmin={isAdmin}
                token={token}
                userId={userId}
                onRefresh={onRefresh}
                isEmailCategory={true}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Emails;
