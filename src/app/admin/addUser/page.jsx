'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';
import { useRouter } from 'next/navigation';

export default function AddUserPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('partner');
  const [university, setUniversity] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterRole, setFilterRole] = useState('partner');
  const [editingUser, setEditingUser] = useState(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) router.push('/login');
      else setUserEmail(data.user.email);
    };
    getUser();
  }, [router]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (!error) setUsers(data);
  };

  const filteredUsers = users.filter((u) => u.role === filterRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      if (editingUser) {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            email,
            role,
            university: role === 'partner' ? university : null,
          })
          .eq('id', editingUser.id);

        if (updateError) throw updateError;

        setMessage('User updated successfully!');
      } else {
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (authError) throw authError;

        const { error: dbError } = await supabase.from('users').insert({
          id: authUser.user.id,
          email,
          role,
          university: role === 'partner' ? university : null,
        });

        if (dbError) throw dbError;

        setMessage('User created successfully!');
      }

      resetForm();
      await fetchUsers();
    } catch (error) {
      setMessage(error.message || 'An error occurred');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEmail(user.email);
    setRole(user.role);
    setUniversity(user.university || '');
    setShowForm(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await supabase.from('users').delete().eq('id', userId);
        await supabase.auth.admin.deleteUser(userId);
        await fetchUsers();
        setMessage('User deleted successfully!');
      } catch (error) {
        setMessage(error.message || 'Failed to delete user');
      }
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setRole(filterRole);
    setUniversity('');
    setShowForm(false);
    setEditingUser(null);
    setMessage('');
  };

  if (!userEmail) return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1F2163]"></div></div>;

  return (
    <Sidebar role="admin" email={userEmail}>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header with Gradient Background */}
          <div className="bg-gradient-to-r from-[#1F2163] to-[#161A42] p-6 rounded-xl shadow-lg mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">User Management</h2>
                <p className="text-blue-100 mt-1">Manage admin and partner user accounts</p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(!showForm);
                }}
                className="bg-white text-[#1F2163] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                {showForm ? 'Close Form' : '+ Add User'}
              </button>
            </div>
          </div>

          {/* Role Filter Tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              className={`px-6 py-3 font-medium text-sm ${filterRole === 'partner' ? 'text-[#1F2163] border-b-2 border-[#1F2163]' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setFilterRole('partner')}
            >
              Partner PICs
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm ${filterRole === 'admin' ? 'text-[#1F2163] border-b-2 border-[#1F2163]' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setFilterRole('admin')}
            >
              Admin Users
            </button>
          </div>

          {/* User Form */}
          {showForm && (
            <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-[#1F2163]">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#D9AC42] focus:border-[#D9AC42] transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@university.edu"
                    />
                  </div>

                  {!editingUser && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#D9AC42] focus:border-[#D9AC42] transition-all"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-sm text-gray-600 hover:text-gray-800"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>
                  )}

                  {filterRole === 'partner' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                      <input
                        type="text"
                        className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#D9AC42] focus:border-[#D9AC42] transition-all"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        required={role === 'partner'}
                        placeholder="University Name"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#1F2163] text-white rounded-lg hover:bg-[#0F1153] transition-colors font-medium"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
                {message && (
                  <p className={`text-sm mt-3 p-3 rounded-lg ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                  </p>
                )}
              </form>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-lg">
                  No {filterRole === 'partner' ? 'Partner PICs' : 'Admin Users'} found
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 bg-[#1F2163] text-white px-4 py-2 rounded-lg hover:bg-[#0F1153] transition-colors"
                >
                  Add {filterRole === 'partner' ? 'Partner PIC' : 'Admin User'}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-l font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      {filterRole === 'partner' && (
                        <th className="px-6 py-4 text-left text-l font-medium text-gray-500 uppercase tracking-wider">University</th>
                      )}
                      <th className="px-6 py-4 text-right text-l font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        </td>
                        {filterRole === 'partner' && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {user.university || <span className="text-gray-400">-</span>}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-[#1F2163] hover:text-[#0F1153] mr-6 font-medium hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-800 font-medium hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}