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

  if (!userEmail) return <div className="p-6">Loading...</div>;

  return (
    <Sidebar role="admin" email={userEmail}>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[#1F2163]">Manage Users</h2>
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="bg-[#D9AC42] text-white px-4 py-2 rounded-lg hover:bg-[#c3932d] transition-colors"
            >
              {showForm ? 'Close' : 'Add User'}
            </button>
          </div>

          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 font-medium ${filterRole === 'partner' ? 'text-[#1F2163] border-b-2 border-[#1F2163]' : 'text-gray-500'}`}
              onClick={() => setFilterRole('partner')}
            >
              Partner PICs
            </button>
            <button
              className={`px-4 py-2 font-medium ${filterRole === 'admin' ? 'text-[#1F2163] border-b-2 border-[#1F2163]' : 'text-gray-500'}`}
              onClick={() => setFilterRole('admin')}
            >
              Admins
            </button>
          </div>

          {showForm && (
            <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-8">
              <h3 className="text-lg font-semibold mb-4 text-[#1F2163]">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      className="w-full p-2 rounded border border-gray-300 bg-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {!editingUser && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          className="w-full p-2 rounded border border-gray-300 bg-white"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-2 text-sm text-gray-600"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>
                  )}

                  {filterRole === 'partner' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                      <input
                        type="text"
                        className="w-full p-2 rounded border border-gray-300 bg-white"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        required={role === 'partner'}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1F2163] text-white rounded-md hover:bg-[#0F1153]"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
                {message && <p className="text-sm text-green-700 mt-2">{message}</p>}
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No {filterRole === 'partner' ? 'Partner PICs' : 'Admins'} found
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    {filterRole === 'partner' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                    )}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      {filterRole === 'partner' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.university || '-'}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-[#1F2163] hover:text-[#0F1153] mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
