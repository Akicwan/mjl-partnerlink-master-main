'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletedItems, setDeletedItems] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push('/login');
        return;
      }

      setUserEmail(user.email);

      // Get user role from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', user.email)
        .single();

      if (profileError) {
        console.error('Error fetching user role:', profileError);
        return;
      }

      setUserRole(profileData.role);

      // Fetch user-specific notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });

      if (!notificationsError) {
        setNotifications(notificationsData);
        // Mark all as read when page loads
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_email', user.email)
          .eq('read', false);
      }
      
      setLoading(false);
    };

    fetchUserData();
  }, [router]);

  const handleDelete = async (id) => {
    const notificationToDelete = notifications.find(n => n.id === id);
    setDeletedItems(prev => [...prev, { ...notificationToDelete, deletedAt: new Date() }]);
    
    setNotifications(prev => prev.filter(n => n.id !== id));
    await supabase.from('notifications').delete().eq('id', id);
  };

  const handleUndo = async (id) => {
    const itemToRestore = deletedItems.find(item => item.id === id);
    if (!itemToRestore) return;

    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        ...itemToRestore,
        created_at: itemToRestore.created_at || new Date()
      }]);

    if (!error) {
      setNotifications(prev => [data[0], ...prev]);
      setDeletedItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Clear old undo items after timeout
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setDeletedItems(prev => 
        prev.filter(item => now - item.deletedAt < 10000) // Keep for 10 seconds
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter notifications by role
  const filteredNotifications = notifications.filter(notification => {
    if (userRole === 'admin') {
      return notification.type === 'admin' || notification.type === 'all';
    } else if (userRole === 'partner') {
      return notification.type === 'partner' || notification.type === 'all';
    }
    return true;
  });

  return (
    <Sidebar role={userRole} email={userEmail}>
      <div className="text-black p-6 bg-white rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[#1F2163]">
            {userRole === 'admin' ? 'Admin Notifications' : 'My Notifications'}
          </h1>
          {notifications.length > 0 && (
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to delete all notifications?')) {
                  notifications.forEach(n => handleDelete(n.id));
                }
              }}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Undo Toast Notifications */}
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {deletedItems.map(item => (
            <div 
              key={item.id} 
              className="bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg flex items-center"
            >
              <span>Notification deleted</span>
              <button 
                onClick={() => handleUndo(item.id)}
                className="ml-4 text-blue-300 hover:text-white"
              >
                Undo
              </button>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-100 h-20 rounded-xl"></div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No notifications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`group p-4 bg-white rounded-xl shadow-sm border-l-4 ${
                  notification.type === 'admin' ? 'border-[#1F2163]' : 
                  notification.type === 'partner' ? 'border-[#D9AC42]' : 'border-gray-300'
                } hover:shadow-md transition-shadow relative`}
              >
                <div className="flex justify-between items-start">
                  <div className="pr-8">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#1F2163]">{notification.title}</h3>
                      {notification.urgent && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-400">
                        {new Date(notification.created_at).toLocaleString('en-MY', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {notification.type && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notification.type === 'admin' ? 'bg-[#1F2163]/10 text-[#1F2163]' :
                          notification.type === 'partner' ? 'bg-[#D9AC42]/10 text-[#D9AC42]' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {notification.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                  title="Delete notification"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Sidebar>
  );
}