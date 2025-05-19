'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function UploadProfilePicture() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loadingEmailUpdate, setLoadingEmailUpdate] = useState(false);
  const [showEditPasswordModal, setShowEditPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loadingPasswordUpdate, setLoadingPasswordUpdate] = useState(false);
  const [role, setRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchUserData() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return setError('Failed to get user.');
      setEmail(user.email);
      setNewEmail(user.email);

      const { data, error: dbError } = await supabase
        .from('users')
        .select('profile_picture_url, role')
        .eq('id', user.id)
        .single();

      if (data?.profile_picture_url) setImageUrl(data.profile_picture_url);
      if (data?.role) setRole(data.role);
    }  

    fetchUserData();
  }, []);

  async function handleUpload(event) {
    setUploading(true);
    setError(null);
    const file = event.target.files[0];
    if (!file) return setUploading(false);

    const { data: { user } } = await supabase.auth.getUser();
    const filePath = `public/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, file);

    if (uploadError) {
      setError(uploadError.message);
      return setUploading(false);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath);

    setImageUrl(publicUrl);

    await supabase
      .from('users')
      .update({ profile_picture_url: publicUrl })
      .eq('email', email);

    setUploading(false);
  }

  async function handlePasswordVerification() {
    setLoadingEmailUpdate(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (signInError) {
      setError('Incorrect password.');
      setLoadingEmailUpdate(false);
      return;
    }

    const { error: emailError } = await supabase.auth.updateUser({ email: newEmail });

    if (emailError) {
      setError('Failed to update email.');
      setLoadingEmailUpdate(false);
      return;
    }

    await supabase.from('users').update({ email: newEmail }).eq('id', user.id);

    alert('Email updated successfully.');
    setEmail(newEmail);
    setShowPasswordModal(false);
    setPassword('');
    setLoadingEmailUpdate(false);
  }

  async function handlePasswordChange() {
    if (newPassword !== confirmNewPassword) {
      return setError('New passwords do not match.');
    }

    setLoadingPasswordUpdate(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      setError('Incorrect current password.');
      return setLoadingPasswordUpdate(false);
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError('Failed to update password.');
    } else {
      alert('Password updated successfully.');
      setShowEditPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }

    setLoadingPasswordUpdate(false);
  }

  return (
    <div className="min-h-screen bg-[#692B2C] flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#1F2163]">Profile</h2>

        <div className="flex flex-col items-center gap-4 mb-6">
          {imageUrl ? (
            <img src={imageUrl} className="rounded-full w-40 h-40 object-cover border-4 border-[#D9AC42]" />
          ) : (
            <div className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="w-full text-sm text-gray-600 file:bg-[#D9AC42] file:text-white file:px-4 file:py-2 file:rounded-md hover:file:bg-[#b68f2d]"
        />

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
          />
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full bg-[#1F2163] text-white py-2 rounded-md font-medium hover:bg-[#161743]"
          >
            Edit Email
          </button>
        </div>

        <button
          onClick={() => setShowEditPasswordModal(true)}
          className="w-full mt-4 bg-[#D9AC42] text-white py-2 rounded-md font-medium hover:bg-[#b68f2d]"
        >
          Edit Password
        </button>

        <button
  onClick={() => router.push(role === 'admin' ? '/admin' : '/partner')}
  className="w-full mt-6 bg-gray-200 text-gray-800 py-2 rounded-md font-medium hover:bg-gray-300"
>
  Back to Dashboard
</button>


        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
      </div>

      {/* Email Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-semibold mb-4 text-center">Confirm Password</h3>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded-md mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handlePasswordVerification}
                className="w-full bg-[#1F2163] text-white py-2 rounded-md"
              >
                {loadingEmailUpdate ? 'Updating...' : 'Confirm'}
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setError(null);
                }}
                className="w-full bg-gray-200 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Password Modal */}
      {showEditPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-semibold mb-4 text-center">Change Password</h3>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded-md mb-3"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded-md mb-3"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded-md mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handlePasswordChange}
                className="w-full bg-[#1F2163] text-white py-2 rounded-md"
              >
                {loadingPasswordUpdate ? 'Updating...' : 'Update Password'}
              </button>
              <button
                onClick={() => {
                  setShowEditPasswordModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setError(null);
                }}
                className="w-full bg-gray-200 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
