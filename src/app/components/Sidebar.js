'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Sidebar({ children, role, email }) {
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState('/user.png');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const links = {
    admin: [
      { name: 'Dashboard', href: '/admin', icon: '🏠' },
      { name: 'Agreements', href: '/admin/agreements', icon: '📝' },
      { name: 'Universities', href: '/admin/university', icon: '🏛️' },
      { name: 'Add Agreement', href: '/admin/form', icon: '➕' },
      { name: 'Users', href: '/admin/addUser', icon: '👥' },
    ],
    partner: [
      { name: 'Dashboard', href: '/partner', icon: '🏠' },
    ],
  };

  const userName = email?.split('@')[0] || 'User';
  const navLinks = links[role] || [];

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

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    };

    fetchNotifications();
  }, [email]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(notifications.map(n => 
        n.id === id ? {...n, read: true} : n
      ));
      setUnreadCount(unreadCount - 1);
    }
  };

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#e8b756] to-[#e8b756]"> 
      {/* Sidebar */}
      <div className="w-55 bg-[#1F2163] flex flex-col p-0 shadow-xl relative">
      {/* Full-width Logo touching top corners */}
<div className="-mt-2 mb-4">
  <img
    src="/partnerLink2.png"
    alt="Logo"
    className="w-full h-auto object-cover rounded-none"
  />
</div>


        {/* Navigation Links */}
        <nav className="flex flex-col gap-4 px-4 py-4 flex-grow">
  {navLinks.map((link) => {
    const isActive = pathname === link.href;
    return (
      <Link
        key={link.href}
        href={link.href}
        className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-[#2A2E7A] text-white font-bold shadow-inner' // Changed to darker blue
            : 'text-white font-semibold hover:bg-[#2A2E7A]/80 hover:shadow-md' // Hover state
        }`}
      >
        <span className="text-xl mr-3">{link.icon}</span>
        <span className="text-sm tracking-wide">
          {link.name}
        </span>
        {isActive && (
          <span className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></span>
        )}
      </Link>
    );
  })}
</nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <div className="bg-white shadow-md rounded-lg mx-4 mt-4 px-6 py-4 flex justify-between items-center">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">
              {navLinks.find(link => pathname === link.href)?.name || 'Dashboard'}
            </h1>
          </div>

          {/* Notification Icon */}
          <div className="relative mr-4" ref={notifDropdownRef}>
            <button
              onClick={() => {
                if (role === 'admin') {
                  router.push('/notiftest');
                } else if (role === 'partner') {
                  router.push('/notiftestPartner');
                }
              }}
              className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 relative"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <span className="font-medium text-gray-700">{userName}</span>
              <img
                src={avatarUrl}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/user.png';
                }}
                alt="Profile"
                className="w-9 h-9 rounded-full border-2 border-[#3498db] object-cover"
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 overflow-hidden border border-gray-200">
                <Link
                  href="/UserProfile"
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-lg shadow-sm m-4 p-6 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}