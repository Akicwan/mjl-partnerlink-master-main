'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Adjust if path differs

export default function Sidebar({ children, role, email }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [avatarUrl, setAvatarUrl] = useState('/user.png'); // Default profile pic

  const links = {
    admin: [
      { name: 'Dashboard', href: '/admin' },
      { name: 'Agreements', href: '/admin/agreements' },
      { name: 'Universities', href: '/admin/university'},
      { name: 'Add Agreement', href: '/admin/form' },
      { name: 'Users', href: '/admin/addUser' },

      
      
    ],
    partner: [
      { name: 'Dashboard', href: '/partner' },
      // Add partner links if needed
    ],
  };

  const userName = email?.split('@')[0] || 'User';
  const navLinks = links[role] || [];

  // Fetch avatar from Supabase
  useEffect(() => {
    async function fetchAvatar() {
      if (!email) return;

      const { data, error } = await supabase
        .from('users')
        .select('profile_picture_url')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Error fetching avatar:', error.message);
        setAvatarUrl('/user.png');
      } else if (data?.profile_picture_url) {
        setAvatarUrl(data.profile_picture_url);
      } else {
        setAvatarUrl('/user.png');
      }
    }

    fetchAvatar();
  }, [email]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#5D2E2E]">
      {/* Sidebar */}
      <div className="w-64 bg-[#D9AC42] flex flex-col p-4 shadow-lg">
        {/* Logo */}
        <div className="flex items-center justify-center mb-10">
          <img
            src="/MJL-UTM-MJIIT-LOGO.png"
            alt="UTM Logo"
            className="h-38 w-48 rounded-lg shadow-lg"
          />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white text-left hover:text-[#1F2163] font-semibold"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-6">
        {/* Top Header */}
        <div className="bg-[#1F2163] rounded-t-xl px-6 py-4 flex justify-between items-center shadow-md">
          <div className="flex-1"></div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center space-x-3 text-white focus:outline-none"
            >
              <span className="font-semibold">{userName}</span>
              <img
                src={avatarUrl}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/user.png';
                }}
                alt="Profile"
                className="w-9 h-9 rounded-full bg-white object-cover"
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                <Link
                  href="/UserProfile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white flex-1 p-6 rounded-b-xl shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
