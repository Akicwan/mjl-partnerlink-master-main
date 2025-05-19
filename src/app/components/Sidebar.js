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
      { name: 'Dashboard', href: '/admin' },
      { name: 'Agreements', href: '/admin/agreements' },
      { name: 'Universities', href: '/admin/university' },
      { name: 'Add Agreement', href: '/admin/form' },
      { name: 'Users', href: '/admin/addUser' },
      { name: 'notif test', href: '/notiftest' },
    ],
    partner: [
      { name: 'Dashboard', href: '/partner' },
      { name: 'notif test', href: '/notiftestPartner' },
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
      <div className="w-50 bg-[#D9AC42] flex flex-col p-4 shadow-xl relative">
        {/* Logo without padding */}
        <div className="mb-8 mt-4">
          <img
            src="/MJL-UTM-MJIIT-LOGO.png"
            alt="UTM Logo"
            className="h-32 w-full object-contain rounded-lg"
          />
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2 px-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-[#c39938] text-white font-bold shadow-inner'
                    : 'text-white font-semibold hover:bg-[#c39938]/80 hover:shadow-md'
                }`}
              >
                <span className={`${isActive ? 'opacity-100' : 'opacity-100'} tracking-wide`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar bottom decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#b89134] shadow-top" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-6">
        {/* Top Header */}
        <div className="bg-[#1F2163] rounded-t-xl px-6 py-4 flex justify-between items-center shadow-md">
          <div className="flex-1"></div>

           {/* Notification Icon */}
           <div className="relative" ref={notifDropdownRef}>
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="p-2 rounded-full hover:bg-[#1F2163]/80 transition-colors relative"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-20 overflow-hidden">
                <div className="p-3 border-b border-gray-200 bg-[#B99950]">
                  <h3 className="text-white font-semibold">Notifications</h3>
                </div>
                <div className="max-h-90 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No notifications</div>
                  ) : (
                    notifications.map(notification => (
                      <Link 
                        key={notification.id}
                        href="#"
                        onClick={() => markAsRead(notification.id)}
                        className={`block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${!notification.read ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex justify-between">
                          <h4 className="font-medium text-[#1F2163]">{notification.title}</h4>
                          {!notification.read && (
                            <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </Link>
                    ))
                  )}
                </div>
                <Link 
                  href="/notifications"
                  className="block text-center py-2 text-sm text-[#1F2163] font-medium hover:bg-gray-100"
                >
                  View All Notifications
                </Link>
              </div>
            )}
          </div>

          {/* Profile Dropdown with increased spacing */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center space-x-4 text-white focus:outline-none"
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

        {/* Content Container */}
        <div className="bg-white flex-1 p-6 rounded-b-xl shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}