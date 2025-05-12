'use client';

import { useState } from 'react';

export default function AddUserPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('partner');
  const [university, setUniversity] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Creating user...');

    const res = await fetch('/api/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role, university }),
    });

    const result = await res.json();

    if (!res.ok) {
      setStatus(`Error: ${result.error}`);
    } else {
      setStatus('✅ User created successfully!');
      setEmail('');
      setPassword('');
      setUniversity('');
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Create New User</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          required
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          className="w-full border p-2 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="partner">Partner</option>
          <option value="admin">Admin</option>
        </select>
        {role === 'partner' && (
          <input
            type="text"
            placeholder="University Name"
            className="w-full border p-2 rounded"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            required
          />
        )}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add User
        </button>
        <p className="text-sm mt-2 text-gray-600">{status}</p>
      </form>
    </div>
  );
}
