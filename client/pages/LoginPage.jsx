import React, { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = (name || '').trim();
    if (!trimmed) return alert('Enter a valid username');
    onLogin(trimmed);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Join Chat</h2>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Enter a username (e.g. Matty)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
          />
          <button type="submit">Join</button>
        </form>
        <p className="muted">No password required — this is a username-only demo for the assignment.</p>
      </div>
    </div>
  );
}
