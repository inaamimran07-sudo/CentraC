import React, { useState } from 'react';
import Subcategories from './Subcategories';
import '../styles/Categories.css';

function Emails({ isAdmin, token, userId, onRefresh }) {
  const [selectedCategory, setSelectedCategory] = useState('Corporation Tax Return Emails');

  const emailCategories = [
    { id: 'corp-tax-emails', name: 'Corporation Tax Return Emails' },
    { id: 'self-assessment-emails', name: 'Self Assessment Emails' }
  ];

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

      <div className="categories-tabs">
        {emailCategories.map(cat => (
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
        {selectedCategory === 'Corporation Tax Return Emails' && (
          <Subcategories
            categoryId="corp-tax-emails"
            categoryName="Corporation Tax Return Emails"
            isAdmin={isAdmin}
            token={token}
            userId={userId}
            onRefresh={onRefresh}
            isEmailCategory={true}
          />
        )}
        {selectedCategory === 'Self Assessment Emails' && (
          <Subcategories
            categoryId="self-assessment-emails"
            categoryName="Self Assessment Emails"
            isAdmin={isAdmin}
            token={token}
            userId={userId}
            onRefresh={onRefresh}
            isEmailCategory={true}
          />
        )}
      </div>
    </div>
  );
}

export default Emails;
