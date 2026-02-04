import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import API_URL from '../config';
import '../styles/Subcategories.css';

function Subcategories({ categoryId, token, userId, onRefresh }) {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterByUser, setFilterByUser] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    assignedToUserId: '',
    priority: 'low',
    progress: 'not-started',
    dueDate: ''
  });

  useEffect(() => {
    fetchSubcategories();
    fetchTeamMembers();
  }, [filterByUser]);

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(API_URL + '/api/team-members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeamMembers(response.data);
    } catch (err) {
      console.error('Error fetching team members:', err);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await axios.get(
        API_URL + `/api/categories/${categoryId}/subcategories?filterByUser=${filterByUser}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubcategories(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      setLoading(false);
    }
  };

  const handleCreateSubcategory = async (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.dueDate) {
      alert('Please fill all required fields');
      return;
    }

    try {
      await axios.post(
        API_URL + '/api/subcategories',
        { categoryId, ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSubcategories();
      setFormData({ companyName: '', description: '', assignedToUserId: '', priority: 'low', progress: 'not-started', dueDate: '' });
      setShowModal(false);
      onRefresh();
    } catch (err) {
      alert('Error creating subcategory');
    }
  };

  const handleUpdateSubcategory = async (id, updates) => {
    try {
      await axios.put(
        API_URL + `/api/subcategories/${id}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSubcategories();
      onRefresh();
    } catch (err) {
      alert('Error updating subcategory');
    }
  };

  const handleDeleteSubcategory = async (id) => {
    const firstConfirm = window.confirm('⚠️ WARNING: Delete this account?\n\nThis action cannot be undone!');
    if (!firstConfirm) return;
    
    const secondConfirm = window.confirm('Are you absolutely sure you want to delete this account?');
    if (!secondConfirm) return;
    try {
      await axios.delete(API_URL + `/api/subcategories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSubcategories();
      onRefresh();
    } catch (err) {
      alert('Error deleting subcategory');
    }
  };

  const getPriorityFlash = (priority) => {
    if (priority === 'high') return 'priority-flash-high';
    if (priority === 'medium') return 'priority-flash-medium';
    if (priority === 'low') return 'priority-flash-low';
    return '';
  };

  const getProgressClass = (progress) => {
    if (progress === 'completed') return 'progress-completed';
    if (progress === 'completed-not-submitted') return 'progress-completed-not-submitted';
    if (progress === 'in-progress') return 'progress-in-progress';
    return 'progress-not-started';
  };

  const formatDateInput = (dateValue) => {
    if (!dateValue) return '';
    return new Date(dateValue).toISOString().slice(0, 10);
  };

  const filteredSubcategories = subcategories.filter((sub) => {
    if (priorityFilter === 'all') return true;
    const currentPriority = sub.autoPriority || sub.priority;
    return currentPriority === priorityFilter;
  });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="subcategories">
      <div className="subcategories-header">
        <button onClick={() => setShowModal(true)} className="add-btn">
          + Add Account
        </button>
        <div className="subcategories-filters">
          <div className="filter-group">
            <label>Sort by Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filterByUser}
              onChange={(e) => setFilterByUser(e.target.checked)}
            />
            My Accounts Only
          </label>
        </div>
      </div>

      <div className="subcategories-list">
        {filteredSubcategories.length === 0 ? (
          <p className="no-data">No accounts in this category</p>
        ) : (
          filteredSubcategories.map(sub => (
            <div
              key={sub.id}
              className={`subcategory-card ${getProgressClass(sub.progress)} ${getPriorityFlash(sub.autoPriority || sub.priority)}`}
            >
              <div className="subcategory-date">
                Due: {new Date(sub.dueDate).toLocaleDateString()}
              </div>
              <div className="subcategory-top">
                <div className="subcategory-info">
                  <input
                    className="inline-input"
                    defaultValue={sub.companyName}
                    onBlur={(e) => {
                      if (e.target.value && e.target.value !== sub.companyName) {
                        handleUpdateSubcategory(sub.id, { companyName: e.target.value });
                      }
                    }}
                  />
                  <p className="created-date">
                    Created: {new Date(sub.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="priority-badge" style={{
                  backgroundColor: 
                    (sub.autoPriority || sub.priority) === 'high' ? '#FF6B6B' :
                    (sub.autoPriority || sub.priority) === 'medium' ? '#FFA07A' : '#98D8C8'
                }}>
                  {(sub.autoPriority || sub.priority).toUpperCase()}
                </div>
              </div>

              <div className="subcategory-details">
                <div className="detail-item">
                  <label>Progress:</label>
                  <select
                    value={sub.progress}
                    onChange={(e) => handleUpdateSubcategory(sub.id, { progress: e.target.value })}
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed-not-submitted">Completed but not submitted</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="detail-item">
                  <label>Priority:</label>
                  <select
                    value={sub.priority}
                    onChange={(e) => handleUpdateSubcategory(sub.id, { priority: e.target.value })}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div className="detail-item">
                  <label>Description:</label>
                  <textarea
                    className="inline-textarea"
                    defaultValue={sub.description || ''}
                    onBlur={(e) => {
                      if (e.target.value !== (sub.description || '')) {
                        handleUpdateSubcategory(sub.id, { description: e.target.value });
                      }
                    }}
                    rows="2"
                  />
                </div>
                <div className="detail-item">
                  <label>Person:</label>
                  <select
                    value={sub.assignedToUserId || ''}
                    onChange={(e) => handleUpdateSubcategory(sub.id, { assignedToUserId: e.target.value })}
                    style={{ color: sub.assignedToColor || '#333', fontWeight: 600 }}
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="detail-item">
                  <label>Accounts Due:</label>
                  <input
                    type="date"
                    value={formatDateInput(sub.dueDate)}
                    onChange={(e) => handleUpdateSubcategory(sub.id, { dueDate: e.target.value })}
                  />
                </div>
              </div>

              <button
                onClick={() => handleDeleteSubcategory(sub.id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Account</h3>
            <form onSubmit={handleCreateSubcategory}>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Name of person doing the accounts</label>
                <select
                  value={formData.assignedToUserId}
                  onChange={(e) => setFormData({ ...formData, assignedToUserId: e.target.value })}
                >
                  <option value="">Select team member</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div className="form-group">
                <label>Progress</label>
                <select
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed-not-submitted">Completed but not submitted</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label>Accounts Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Subcategories;
