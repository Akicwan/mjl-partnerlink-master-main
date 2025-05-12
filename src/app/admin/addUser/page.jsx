'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';
import { useRouter } from 'next/navigation';

export default function AddUserPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [university, setUniversity] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(''); // success or error
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) router.push('/login');
      else setUserEmail(data.user.email);
    };
    getUser();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage(null);

    try {
      // Create user in auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Insert into users table
      const { error: dbError } = await supabase.from('users').insert({
        id: authUser.user.id,
        email,
        role,
        university: role === 'partner' ? university : null,
      });

      if (dbError) throw dbError;

      setMessageType('success');
      setMessage('User created successfully!');
      setEmail('');
      setPassword('');
      setRole('admin');
      setUniversity('');
    } catch (error) {
      setMessageType('error');
      setMessage(error.message || 'An error occurred');
    }
  };

  if (!userEmail) return <p className="p-6">Loading...</p>;

  return (
    <Sidebar role="admin" email={userEmail}>
      <div className="animate-fadeIn max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-gray-200">
        <h2 className="text-2xl font-bold text-[#1F2163] mb-6">Add New User</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="w-full border rounded-md px-4 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              className="w-full border rounded-md px-4 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Role</label>
            <select
              className="w-full border rounded-md px-4 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="partner">Partner</option>
            </select>
          </div>

          {role === 'partner' && (
            <div>
              <label className="block mb-1 font-medium text-gray-700">University</label>
              <input
                type="text"
                required
                className="w-full border rounded-md px-4 py-2"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            className="bg-[#D9AC42] hover:bg-[#FFB347] text-white font-semibold py-2 px-6 rounded-md transition-all"
          >
            Add User
          </button>

          {message && (
            <div
              className={`mt-4 px-4 py-2 rounded-md text-sm ${
                messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </div>

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Sidebar>
  );
}
