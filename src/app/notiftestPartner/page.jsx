'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/SidebarPartner';

export default function PartnerNotification() {
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [selectedTab, setSelectedTab] = useState('unread');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');

  // Get logged-in user info (email + university)
  useEffect(() => {
    async function getUserInfo() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email);

        const { data, error } = await supabase
          .from('users')
          .select('university')
          .eq('email', user.email)
          .single();

        if (data && !error) {
          setUniversity(data.university);
        }
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

  // Fetch university-specific notifications
  useEffect(() => {
    async function fetchNotifications() {
      if (!university) return;

      const { data: agreements, error } = await supabase
        .from('agreements_2')
        .select('id, end_date, agreement_type, abbreviation, university')
        .eq('university', university);

      if (error || !agreements) {
        console.error('Fetch error:', error);
        return;
      }

      const today = new Date();
      const notes = [];

      for (const ag of agreements) {
        if (!ag.end_date) continue;

        const endDate = new Date(ag.end_date);
        const formattedDate = endDate.toLocaleDateString('en-MY', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        const oneMonthAhead = new Date(today);
        oneMonthAhead.setMonth(today.getMonth() + 1);

        const sixMonthsAhead = new Date(today);
        sixMonthsAhead.setMonth(today.getMonth() + 6);

        const base = {
          id: ag.id,
          agreement_type: ag.agreement_type,
          abbreviation: ag.abbreviation,
          university: ag.university,
          end_date: formattedDate,
        };

        if (endDate < today) {
          notes.push({
            ...base,
            type: 'expired',
            title: `${ag.abbreviation} ${ag.agreement_type} agreement has expired`,
            message: `- ${ag.university} ${ag.agreement_type} agreement expired on ${formattedDate}`,
          });
        } else {
          if (endDate <= sixMonthsAhead) {
            notes.push({
              ...base,
              type: '6-month',
              title: `${ag.abbreviation} ${ag.agreement_type} agreement is ending in 6 months`,
              message: `- ${ag.university} ${ag.agreement_type} agreement is ending on ${formattedDate}`,
            });
          }
          if (endDate <= oneMonthAhead) {
            notes.push({
              ...base,
              type: '1-month',
              title: `${ag.abbreviation} ${ag.agreement_type} agreement is ending in 1 month`,
              message: `- ${ag.university} ${ag.agreement_type} agreement is ending on ${formattedDate}`,
            });
          }
        }
      }

      setNotifications(notes);
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
    <Sidebar role="partner" email={email}>
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

        {visibleNotifications.length === 0 ? (
          <p>No {selectedTab} notifications.</p>
        ) : (
          <ul className="space-y-3">
            {visibleNotifications.map((note) => {
              const readKey = note.id + '-' + note.type;
              const isRead = readIds.has(readKey);

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
                      <strong className={isRead ? 'font-normal' : 'font-semibold'}>{note.title}</strong>
                      <p className="mt-1">{note.message}</p>
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
