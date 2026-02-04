import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import '../styles/TeamMembers.css';

function TeamMembers({ isAdmin, token, onRefresh }) {
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
  ];

  useEffect(() => {
    fetchTeamMembers();
    if (isAdmin) {
      fetchPendingUsers();
    }
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(API_URL + '/api/team-members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeamMembers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    if (!isAdmin) return;
    try {
      const response = await axios.get(API_URL + '/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableUsers(response.data);
    } catch (err) {
      console.error('Error fetching available users:', err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      alert('Please select a user');
      return;
    }

    try {
      await axios.post(
        API_URL + '/api/team-members',
        { userId: parseInt(selectedUserId), color: selectedColor },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTeamMembers();
      setShowModal(false);
      setSelectedUserId('');
      setSelectedColor('#FF6B6B');
      onRefresh();
    } catch (err) {
      alert('Error adding team member');
    }
  };

  const handleRemoveMember = async (id) => {
    const firstConfirm = window.confirm('⚠️ WARNING: Remove this team member?\n\nThey will lose access to all assigned accounts.');
    if (!firstConfirm) return;
    
    const secondConfirm = window.confirm('Are you absolutely sure you want to remove this team member?');
    if (!secondConfirm) return;
    try {
      await axios.delete(API_URL + `/api/team-members/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTeamMembers();
      onRefresh();
    } catch (err) {
      alert('Error removing team member');
    }
  };

  const fetchPendingUsers = async () => {
    if (!isAdmin) return;
    try {
      const response = await axios.get(API_URL + '/api/users/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingUsers(response.data);
    } catch (err) {
      console.error('Error fetching pending users:', err);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await axios.post(
        API_URL + `/api/users/${userId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPendingUsers();
      fetchAvailableUsers();
      onRefresh();
    } catch (err) {
      alert('Error approving user');
    }
  };

  const handleRejectUser = async (userId) => {
    const firstConfirm = window.confirm('⚠️ WARNING: Reject and delete this user account permanently?\n\nThis action cannot be undone!');
    if (!firstConfirm) return;
    
    const secondConfirm = window.confirm('Are you absolutely sure you want to reject and delete this user?');
    if (!secondConfirm) return;
    try {
      await axios.delete(API_URL + `/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPendingUsers();
      onRefresh();
    } catch (err) {
      alert('Error rejecting user');
    }
  };

  if (loading) return <div className="loading">Loading team members...</div>;

  return (
    <div
      className="team-members"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/centra-logo.png)`,
        backgroundSize: '300px 300px',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="section-header">
        <h2>Team Members</h2>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {pendingUsers.length > 0 && (
              <button 
                onClick={() => setShowPendingModal(true)} 
                className="add-btn"
                style={{ backgroundColor: '#ff9800' }}
              >
                ⏳ Pending ({pendingUsers.length})
              </button>
            )}
            <button onClick={() => {
              fetchAvailableUsers();
              setShowModal(true);
            }} className="add-btn">
              + Add to Team
            </button>
          </div>
        )}
      </div>

      <div className="team-members-list">
        {teamMembers.map(member => (
          <div key={member.id} className="team-member-card">
            <div className="member-avatar" style={{ backgroundColor: member.color || '#ccc' }}>
              <img src="/centra-logo.svg" alt={member.name} className="member-avatar-img" />
            </div>
            <div className="member-info">
              <h3>{member.name}</h3>
              <p>{member.email}</p>
            </div>
            {isAdmin && (
              <button 
                onClick={() => handleRemoveMember(member.id)}
                className="remove-btn"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {showModal && isAdmin && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Team Member</h3>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Select User</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  <option value="">Choose a user...</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F',
                    '#BB8FCE', '#85C1E2', '#F8B4B4', '#B8E6B8', '#FFD93D', '#C9A0DC'].map(color => (
                    <div
                      key={color}
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPendingModal && isAdmin && (
        <div className="modal-overlay" onClick={() => setShowPendingModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Pending User Approvals</h3>
            {pendingUsers.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                No pending users
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingUsers.map(user => (
                  <div key={user.id} style={{
                    padding: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong>{user.name}</strong>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>{user.email}</div>
                      <div style={{ fontSize: '0.8rem', color: '#999' }}>
                        Requested: {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleApproveUser(user.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Approve
                      </button>
                      <button 
                        onClick={() => handleRejectUser(user.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button onClick={() => setShowPendingModal(false)} className="cancel-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamMembers;
