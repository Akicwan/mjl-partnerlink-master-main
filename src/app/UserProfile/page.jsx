'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Mail, User, Camera } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-[#692B2C] to-[#1F2163] flex items-center justify-center p-4">
      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md animate-fade-in">
        {/* Header with Gradient */}
        <div className="bg-white p-6 text-center">
          <h2 className="text-2xl font-bold text-[#1F2163] flex items-center justify-center gap-2">
            <User size={24} />
            Profile Settings
          </h2>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  className="rounded-full w-32 h-32 object-cover border-4 border-[#D9AC42] shadow-lg"
                  alt="Profile"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center border-4 border-[#D9AC42]">
                  <User size={48} className="text-gray-400" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-[#D9AC42] p-2 rounded-full cursor-pointer shadow-md group-hover:bg-[#b68f2d] transition-colors">
                <Camera size={18} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            </div>
            {uploading && (
              <div className="text-sm text-[#1F2163] flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1F2163]"></div>
                Uploading...
              </div>
            )}
          </div>

          {/* Email Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail size={16} />
              Email Address
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#D9AC42] focus:border-[#D9AC42]"
              />
              <button
                onClick={() => setShowPasswordModal(true)}
                className="bg-[#1F2163] hover:bg-[#161743] text-white px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-1"
              >
                <Mail size={16} />
                <span>Update</span>
              </button>
            </div>
          </div>

          {/* Password Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock size={16} />
              Password
            </label>
            <button
              onClick={() => setShowEditPasswordModal(true)}
              className="w-full bg-[#D9AC42] hover:bg-[#b68f2d] text-white py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Lock size={16} />
              Change Password
            </button>
          </div>

          {/* Navigation */}
          <div className="pt-4">
            <button
              onClick={() => router.push(role === 'admin' ? '/admin' : '/partner')}
              className="w-full flex items-center justify-center gap-2 text-[#1F2163] hover:text-[#0F1153] hover:bg-gray-100 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Email Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-center flex items-center justify-center gap-2 text-[#1F2163]">
              <Mail size={20} />
              Confirm Password
            </h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Please enter your current password to update your email
            </p>
            <input
              type="password"
              placeholder="Current Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg mb-4 focus:ring-2 focus:ring-[#D9AC42]"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setError(null);
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordVerification}
                className="flex-1 bg-[#1F2163] hover:bg-[#161743] text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loadingEmailUpdate ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Password Modal */}
      {showEditPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-center flex items-center justify-center gap-2 text-[#1F2163]">
              <Lock size={20} />
              Change Password
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#D9AC42]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#D9AC42]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#D9AC42]"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditPasswordModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setError(null);
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                className="flex-1 bg-[#1F2163] hover:bg-[#161743] text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loadingPasswordUpdate ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}