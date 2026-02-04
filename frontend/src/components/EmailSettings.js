import React, { useState, useEffect, useContext } from 'react';
import axios from '../axiosConfig';
import { AuthContext } from '../context/AuthContext';
import '../styles/EmailSettings.css';

function EmailSettings() {
  const { token } = useContext(AuthContext);
  const [emailProvider, setEmailProvider] = useState('gmail');
  const [email, setEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/email-settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setSettings(response.data);
        setEmailProvider(response.data.provider);
        setEmail(response.data.email);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await axios.post('/api/email-settings', {
        provider: emailProvider,
        email: email,
        appPassword: appPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('✓ Email settings saved! Scanner will check for new emails every 5 minutes.');
      setAppPassword('');
      fetchSettings();
    } catch (err) {
      setMessage('✗ Error saving settings: ' + (err.response?.data?.error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect email? Email scanning will stop.')) return;
    
    try {
      await axios.delete('/api/email-settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('✓ Email disconnected');
      setSettings(null);
      setEmail('');
      setAppPassword('');
    } catch (err) {
      setMessage('✗ Error disconnecting: ' + (err.response?.data?.error || 'Unknown error'));
    }
  };

  const handleScanNow = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // First create email categories if they don't exist
      await axios.post('/api/create-email-categories', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Then scan emails
      await axios.post('/api/scan-emails', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('✓ Email scan completed! Check Email Categories for new accounts.');
    } catch (err) {
      setMessage('✗ Error scanning: ' + (err.response?.data?.error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-settings">
      <div className="section-header">
        <h2>📧 Email Integration Settings</h2>
      </div>

      <div className="settings-container">
        {settings ? (
          <div className="connected-status">
            <div className="status-badge">✓ Connected</div>
            <p><strong>Provider:</strong> {settings.provider === 'gmail' ? 'Gmail' : 'Outlook'}</p>
            <p><strong>Email:</strong> {settings.email}</p>
            <p><strong>Status:</strong> Scanning emails every 5 minutes for keywords</p>
            <div className="button-group">
              <button onClick={handleScanNow} disabled={loading} className="scan-btn">
                {loading ? 'Scanning...' : '🔄 Scan Now'}
              </button>
              <button onClick={handleDisconnect} className="disconnect-btn">
                Disconnect Email
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="settings-form">
            <div className="form-group">
              <label>Email Provider</label>
              <select value={emailProvider} onChange={(e) => setEmailProvider(e.target.value)}>
                <option value="gmail">Gmail</option>
                <option value="outlook" disabled>Outlook (Coming Soon)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                required
              />
            </div>

            <div className="form-group">
              <label>App Password</label>
              <input
                type="password"
                value={appPassword}
                onChange={(e) => setAppPassword(e.target.value)}
                placeholder="xxxx xxxx xxxx xxxx"
                required
              />
              <small>Get your Gmail App Password at: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer">myaccount.google.com/apppasswords</a></small>
            </div>

            <button type="submit" disabled={loading} className="save-btn">
              {loading ? 'Connecting...' : 'Connect Email'}
            </button>
          </form>
        )}

        {message && (
          <div className={`message ${message.startsWith('✓') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="info-box">
          <h3>How it works:</h3>
          <ul>
            <li>Scans your inbox every 5 minutes for new emails</li>
            <li>Detects keywords: "corporation tax", "self assessment"</li>
            <li>Auto-creates accounts in Email Categories with:</li>
            <ul>
              <li>Subject line as account name</li>
              <li>Sender information</li>
              <li>Email date</li>
            </ul>
            <li>Your credentials are encrypted and secure</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default EmailSettings;
