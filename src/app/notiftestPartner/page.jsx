'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';

export default function PartnerNotification() {
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [selectedTab, setSelectedTab] = useState('unread');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get logged-in user info (email + university)
  useEffect(() => {
    async function getUserInfo() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          setLoading(false);
          return;
        }

        setEmail(user.email);

        const { data, error } = await supabase
          .from('users')
          .select('university')
          .eq('email', user.email)
          .single();

        if (data) {
          setUniversity(data.university);
        }
      } catch (err) {
        setLoading(false);
      }
    }

    getUserInfo();
  }, []);

  // Load read notification IDs from localStorage using email
  useEffect(() => {
    if (!email) return;
    const storedRead = localStorage.getItem(`readNotifications_${email}`);
    if (storedRead) {
      setReadIds(new Set(JSON.parse(storedRead)));
    }
  }, [email]);

  // Calculate unread count
  useEffect(() => {
    if (notifications.length > 0) {
      const count = notifications.filter(n => {
        const key = n.id + '-' + n.type;
        return !readIds.has(key);
      }).length;
      setUnreadCount(count);
    } else {
      setUnreadCount(0);
    }
  }, [notifications, readIds]);

  // Fetch university-specific notifications
  useEffect(() => {
    async function fetchNotifications() {
      if (!university) return;

      try {
        setLoading(true);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: agreements, error } = await supabase
          .from('agreements_2')
          .select('id, end_date, agreement_type, abbreviation, university')
          .eq('university', university)
          .order('end_date', { ascending: true });

        if (error) {
          setLoading(false);
          return;
        }

        const notes = [];
        const now = new Date();

        for (const ag of agreements) {
          if (!ag.end_date) continue;

          const endDate = new Date(ag.end_date);
          endDate.setHours(0, 0, 0, 0);
          
          const timeDiff = endDate.getTime() - now.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

          // Skip expired agreements
          if (daysDiff <= 0) continue;

          const formattedDate = endDate.toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          const base = {
            id: ag.id,
            agreement_type: ag.agreement_type,
            abbreviation: ag.abbreviation,
            university: ag.university,
            end_date: formattedDate,
            raw_end_date: endDate,
            days_remaining: daysDiff
          };

          if (daysDiff <= 30) {
            notes.push({
              ...base,
              type: '1-month',
              title: `${ag.abbreviation} Agreement Expiring Soon`,
              message: `${ag.university} ${ag.agreement_type} agreement expires on ${formattedDate}`,
              priority: 1
            });
          } else if (daysDiff <= 180) {
            notes.push({
              ...base,
              type: '6-month',
              title: `${ag.abbreviation} Agreement Expiring`,
              message: `${ag.university} ${ag.agreement_type} agreement expires on ${formattedDate}`,
              priority: 2
            });
          }
        }

        // Sort by days remaining (soonest first)
        const sortedNotes = notes.sort((a, b) => a.days_remaining - b.days_remaining);
        setNotifications(sortedNotes);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [university]);

  // Update read/unread status in state and localStorage
  const updateReadStatus = (idTypeKey, isNowRead) => {
    const updated = new Set(readIds);
    if (isNowRead) {
      updated.add(idTypeKey);
    } else {
      updated.delete(idTypeKey);
    }
    setReadIds(updated);
    localStorage.setItem(`readNotifications_${email}`, JSON.stringify([...updated]));
  };

  const visibleNotifications = notifications.filter((n) => {
    const key = n.id + '-' + n.type;
    return selectedTab === 'unread' ? !readIds.has(key) : readIds.has(key);
  });

  return (
    <Sidebar role="partner" email={email} unreadCount={unreadCount}>
      <div className="p-4 max-w-4xl mx-auto font-sans">
        <h1 className="text-2xl font-bold mb-4">Partner Notification Center</h1>

        <div className="flex mb-4">
          <button
            onClick={() => setSelectedTab('unread')}
            className={`px-4 py-2 rounded mr-2 ${
              selectedTab === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setSelectedTab('read')}
            className={`px-4 py-2 rounded ${
              selectedTab === 'read' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
            }`}
          >
            Read
          </button>
        </div>

        {loading ? (
          <p>Loading notifications...</p>
        ) : visibleNotifications.length === 0 ? (
           <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-700">
              {selectedTab === 'unread' 
                ? "No unread notifications. All agreements are up to date!"
                : "No read notifications yet."}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {visibleNotifications.map((note) => {
              const readKey = note.id + '-' + note.type;
              const isRead = readIds.has(readKey);
              const isUrgent = note.days_remaining <= 30;

              return (
                <li
                  key={readKey}
                  className={`p-4 rounded border ${
                    isRead ? 'bg-gray-100 border-gray-300' : 'bg-blue-50 border-blue-300'
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={isRead}
                      onChange={(e) => updateReadStatus(readKey, e.target.checked)}
                      className="mr-3 mt-1"
                    />
                    <div>
                      <strong className={isRead ? 'font-normal' : 'font-semibold'}>
                        {note.title}
                      </strong>
                      <p className="mt-1">{note.message}</p>
                      <p className="text-sm mt-1">
                        Ends: {note.end_date} • 
                        <span className={`ml-1 ${isUrgent ? 'font-bold text-red-600' : 'text-gray-500'}`}>
                          {note.days_remaining} days remaining
                        </span>
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Sidebar>
  );
}