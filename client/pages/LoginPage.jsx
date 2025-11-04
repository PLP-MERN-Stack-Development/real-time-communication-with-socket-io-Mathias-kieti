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
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Join Chat</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter a username (e.g. Matty)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
            className="w-full p-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <button
            type="submit"
            className="w-full py-3 bg-teal-500 hover:bg-teal-600 rounded-md font-semibold text-gray-900"
          >
            Join
          </button>
        </form>
        <p className="text-gray-400 mt-4 text-sm text-center">
          No password required — username only demo.
        </p>
      </div>
    </div>
  );
}
