'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import Sidebar from '../../../components/Sidebar';

export default function AgreementDetailPage({ params }) {
  const id = Number(params.id);
  const router = useRouter();

  const [userEmail, setUserEmail] = useState(null);
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push('/login');
      } else {
        setUserEmail(data.user.email);
      }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    const fetchAgreement = async () => {
      console.log("Fetching agreement with ID:", id); // ✅ Log the ID
  
      const { data, error } = await supabase
        .from('agreements_2')
        .select('*')
        .eq('id', id)
        .single();
  
      if (error) {
        console.error('Error fetching agreement:', error.message); // ✅ Log the error
      } else {
        console.log("Fetched agreement:", data); // ✅ Log the data
        setAgreement(data);
      }
  
      setLoading(false);
    };
  
    if (id) fetchAgreement();
  }, [id]);
  

  if (loading) return <div className="p-6">Loading agreement info...</div>;
  if (!agreement) return <div className="p-6 text-red-600">Agreement not found.</div>;

  return (
    <Sidebar role="admin" email={userEmail}>
      <div className="p-6 bg-white rounded-2xl text-black shadow-lg">
        <h1 className="text-3xl font-bold text-[#1F2163] mb-6">Agreement Details</h1>
        <div className="space-y-4">
          <p><strong>University:</strong> {agreement.university}</p>
          <p><strong>Agreement Type:</strong> {agreement.agreement_type}</p>
          <p><strong>Start Date:</strong> {new Date(agreement.start_date).toLocaleDateString('en-MY')}</p>
          <p><strong>End Date:</strong> {new Date(agreement.end_date).toLocaleDateString('en-MY')}</p>
          {agreement.pic && <p><strong>Contact Person (PIC):</strong> {agreement.pic}</p>}
          {agreement.email && <p><strong>Email:</strong> {agreement.email}</p>}
          {agreement.activity_type && <p><strong>Activity Type:</strong> {agreement.activity_type}</p>}
        </div>
      </div>
    </Sidebar>
  );
}
