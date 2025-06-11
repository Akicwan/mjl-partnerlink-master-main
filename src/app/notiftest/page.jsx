'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';

export default function NotifTest() {
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [selectedTab, setSelectedTab] = useState('unread');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [hasSentEmails, setHasSentEmails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug function - Print key states
  const debugState = () => {
    console.log('Current state:', {
      email,
      role,
      notifications,
      readIds: [...readIds],
      hasSentEmails,
      loading
    });
  };

  useEffect(() => {
    debugState(); // Debugging status
  }, [notifications, readIds, email, role]);

  async function sendEmailNotification(to, subject, html) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: JSON.stringify({ to, subject, html }),
      });

      if (error) {
        console.error('Failed to send email:', error.message);
      }
      return data;
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  useEffect(() => {
    async function getUserInfo() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          setLoading(false);
          setError('User not authenticated');
          return;
        }

        setEmail(user.email);

        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('email', user.email)
          .single();

        if (data) {
          setRole(data.role);
        } else if (error) {
          console.error('Role fetch error:', error);
        }
      } catch (err) {
        setLoading(false);
        setError('Failed to fetch user info');
        console.error('User info error:', err);
      }
    }

    getUserInfo();
  }, []);

  useEffect(() => {
    if (!email) return;

    const storedRead = localStorage.getItem(`readNotifications-${email}`);
    if (storedRead) {
      try {
        setReadIds(new Set(JSON.parse(storedRead)));
      } catch (e) {
        console.error('Failed to parse read notifications:', e);
        localStorage.removeItem(`readNotifications-${email}`);
      }
    }
  }, [email]);

  useEffect(() => {
    if (!email || hasSentEmails) return;

    async function fetchNotifications() {
      try {
        setLoading(true);
        setError(null);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // 1. Obtain all the protocol data
        const { data: agreements, error: agreementsError } = await supabase
          .from('agreements_2')
          .select('id, end_date, agreement_type, abbreviation, university')
          .order('end_date', { ascending: true });

        if (agreementsError) {
          throw new Error(`Agreements fetch failed: ${agreementsError.message}`);
        }

        console.log('Fetched agreements:', agreements); // 调试
        
        // 2. Handle the notification generation logic
        const notes = [];
        const now = new Date();
        const oneMonthLater = new Date(now);
        oneMonthLater.setMonth(now.getMonth() + 1);
        const sixMonthsLater = new Date(now);
        sixMonthsLater.setMonth(now.getMonth() + 6);

        agreements.forEach(ag => {
          if (!ag.end_date) {
            console.warn('Agreement missing end_date:', ag.id);
            return;
          }

          const endDate = new Date(ag.end_date);
          if (isNaN(endDate.getTime())) {
            console.error('Invalid end date:', ag.end_date);
            return;
          }
          endDate.setHours(0, 0, 0, 0);
          
          const daysDiff = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

          const base = {
            id: ag.id,
            agreement_type: ag.agreement_type,
            abbreviation: ag.abbreviation,
            university: ag.university,
            end_date: endDate.toLocaleDateString('en-MY'),
            raw_end_date: endDate,
            days_remaining: daysDiff
          };

          // 3. Generate notifications based on the expiration time
          if (daysDiff <= 0) {
            // 已过期 - 现在跳过
          } else if (daysDiff <= 30) {
            notes.push({
              ...base,
              type: '1-month',
              title: `${ag.abbreviation} Agreement Expiring Soon (${daysDiff} days)`,
              message: `${ag.university} ${ag.agreement_type} agreement expires on ${base.end_date}`,
              priority: 1
            });
          } else if (daysDiff <= 180) {
            notes.push({
              ...base,
              type: '6-month',
              title: `${ag.abbreviation} Agreement Expiring (in ${Math.floor(daysDiff/30)} months)`,
              message: `${ag.university} ${ag.agreement_type} agreement expires on ${base.end_date}`,
              priority: 2
            });
          }
        });

        // 4. Sorting notification
        const sortedNotes = notes.sort((a, b) => a.days_remaining - b.days_remaining);
        console.log('Generated notifications:', sortedNotes); // 调试

        setNotifications(sortedNotes);

        // 5. Send an unread notification email
        const sendPromises = sortedNotes.map(async note => {
          const key = `${note.id}-${note.type}`;
          if (!readIds.has(key)) {
            await sendEmailNotification(email, note.title, `<p>${note.message}</p>`);
          }
        });

        await Promise.all(sendPromises);
        setHasSentEmails(true);
      } catch (err) {
        console.error('Notification fetch error:', err);
        setError(err.message || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [email, readIds, hasSentEmails]);

  const updateReadStatus = (idTypeKey, isNowRead) => {
    const updated = new Set(readIds);
    if (isNowRead) {
      updated.add(idTypeKey);
    } else {
      updated.delete(idTypeKey);
    }
    setReadIds(updated);
    localStorage.setItem(`readNotifications-${email}`, JSON.stringify([...updated]));
  };

  const visibleNotifications = notifications.filter(n => {
    const key = `${n.id}-${n.type}`;
    return selectedTab === 'unread' ? !readIds.has(key) : readIds.has(key);
  });

  return (
    <Sidebar role={role} email={email}>
      <div className="p-4 max-w-4xl mx-auto font-sans">
        <h1 className="text-2xl font-bold mb-4">Notification Center</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}

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
            {visibleNotifications.map(note => {
              const readKey = `${note.id}-${note.type}`;
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
                      <div className="flex items-center mt-1 text-sm">
                        <span>Ends: {note.end_date}</span>
                        <span className={`ml-2 ${isUrgent ? 'font-bold text-red-600' : 'text-gray-500'}`}>
                          {note.days_remaining} days remaining
                        </span>
                      </div>
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