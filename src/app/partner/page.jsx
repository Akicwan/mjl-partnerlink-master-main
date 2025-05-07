'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient'; // adjust path as needed
import Sidebar from '../components/Sidebar';
import LogoutButton from '../components/LogoutButton';

export default function PartnerDashboard() {
  const [userEmail, setUserEmail] = useState(null);
  const router = useRouter();

  // Fetch user email from Supabase on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push('/login'); // Redirect to login if no user is found
      } else {
        setUserEmail(user.email); // Set the user email state
      }
    };

    fetchUser();
  }, [router]);

  // Partner data
  const partnerData = {
    university: 'Tokyo Tech',
    agreements: 5,
    activities: 12,
    contact: 'Dr. Sato',
  };

  // Avoid rendering until userEmail is loaded
  if (!userEmail) return null;

  // Extract username from the email (before the '@')
  const userName = userEmail.split('@')[0];

  return (
    <Sidebar role="partner" email={userEmail} userName={userName}>
      <div className="text-black">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#1F2163]">Partner Dashboard</h1>
          
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4 max-w-xl">
          <div><strong>University:</strong> {partnerData.university}</div>
          <div><strong>Total Agreements:</strong> {partnerData.agreements}</div>
          <div><strong>Total Activities:</strong> {partnerData.activities}</div>
          <div><strong>Contact Person:</strong> {partnerData.contact}</div>
        </div>
      </div>
    </Sidebar>
  );
}
