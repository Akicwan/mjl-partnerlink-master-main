'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';

export default function AgreementDetails() {
  const [userEmail, setUserEmail] = useState(null);
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const agreementId = searchParams.get('id');

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push('/login');
      } else {
        setUserEmail(user.email);
      }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    const fetchAgreementDetails = async () => {
      if (!agreementId) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('agreements_2')
        .select('*')
        .eq('id', agreementId)
        .single();

      if (error) {
        console.error('Failed to fetch agreement details:', error.message);
        router.push('/partner');
      } else {
        setAgreement(data);
      }
      setLoading(false);
    };

    if (userEmail) {
      fetchAgreementDetails();
    }
  }, [agreementId, userEmail, router]);

  const handleBackClick = () => {
    router.push('/partner');
  };

  const userName = userEmail ? userEmail.split('@')[0] : '';

  if (!userEmail || loading) return <div className="p-4 text-gray-600">Loading...</div>;
  if (!agreement) return <div className="p-4 text-gray-600">Agreement not found</div>;

  return (
    <Sidebar role="partner" email={userEmail} userName={userName}>
      <div className="text-black space-y-6">
       <div className="flex justify-end">
  <button
    onClick={handleBackClick}
    className="flex items-center gap-2 px-4 py-2 bg-[#1F2163] text-white rounded-lg hover:bg-[#3a3d95] transition-colors"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
    </svg>
    Back to Dashboard
  </button>
</div>

  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
  <div className="flex flex-wrap gap-6">
    {/* 每个 section 使用统一的样式类 */}
    <div className="flex-1 min-w-[300px] basis-[calc(50%-0.75rem)] min-h-[400px] flex flex-col justify-between space-y-4 border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-[#1F2163] text-white px-4 py-2">
        <h2 className="text-xl font-semibold">Basic Information</h2>
      </div>
      <div className="space-y-4 p-4 flex-1">
        <DetailItem label="Agreement Type" value={agreement.agreement_type} />
        <DetailItem label="University" value={agreement.university} />
        <DetailItem label="Abbreviation" value={agreement.abbreviation} />
        <DetailItem label="JUC Member" value={agreement.juc_member} />
        <DetailItem label="Start Date" value={agreement.start_date} />
        <DetailItem label="End Date" value={agreement.end_date || '—'} />
        <DetailItem label="I-Kohza" value={agreement.i_kohza} />
        <DetailItem label="PIC MJIIT" value={agreement.pic_mjiit} />
      </div>
    </div>

    {/* 以下三个板块使用相同的样式类，只更换内容标题和 DetailItem 列表 */}
    {/* Collaboration Details */}
    <div className="flex-1 min-w-[300px] basis-[calc(50%-0.75rem)] min-h-[400px] flex flex-col justify-between space-y-4 border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-[#1F2163] text-white px-4 py-2">
        <h2 className="text-xl font-semibold">Collaboration Details</h2>
      </div>
      <div className="space-y-4 p-4 flex-1">
        <DetailItem label="JD/DD" value={agreement.jd_dd} />
        <DetailItem label="Joint Lab" value={agreement.joint_lab} />
        <DetailItem label="Co-Teaching" value={agreement.co_teaching} />
        <DetailItem label="Staff Mobility" value={agreement.staff_mobility} />
        <DetailItem label="Student Mobility" value={agreement.student_mobility} />
      </div>
    </div>

    {/* Research Details */}
    <div className="flex-1 min-w-[300px] basis-[calc(50%-0.75rem)] min-h-[400px] flex flex-col justify-between space-y-4 border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-[#1F2163] text-white px-4 py-2">
        <h2 className="text-xl font-semibold">Research Details</h2>
      </div>
      <div className="space-y-4 p-4 flex-1">
        <DetailItem label="Joint Research" value={agreement.joint_research} />
        <DetailItem label="Joint Publication" value={agreement.joint_publication} />
        <DetailItem label="Joint Supervision" value={agreement.joint_supervision} />
      </div>
    </div>

    {/* Additional Information */}
    <div className="flex-1 min-w-[300px] basis-[calc(50%-0.75rem)] min-h-[400px] flex flex-col justify-between space-y-4 border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-[#1F2163] text-white px-4 py-2">
        <h2 className="text-xl font-semibold">Additional Information</h2>
      </div>
      <div className="space-y-4 p-4 flex-1">
        <DetailItem label="Contacts" value={agreement.contacts} />
        <DetailItem label="Other Details" value={agreement.others} />
      </div>
    </div>
  </div>
</div>

      </div>
    </Sidebar>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="font-bold text-[#1F2163]">{label}:</p>
      <p className="mt-1 text-gray-900 bg-gray-50 p-2 rounded">
        {value || 'Not specified'}
      </p>
    </div>
  );
}
