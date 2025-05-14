'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';
import LogoutButton from '../components/LogoutButton';

export default function PartnerDashboard() {
  const [userEmail, setUserEmail] = useState(null);
  const [universityName, setUniversityName] = useState('');
  const [agreements, setAgreements] = useState([]);
  const [filteredAgreements, setFilteredAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeStats, setTypeStats] = useState({});
  const [agreementTypes, setAgreementTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const router = useRouter();

  const calculateTypeStats = (agreements) => {
    const stats = {};
    agreements.forEach(agreement => {
      const type = agreement.agreement_type || 'Unknown';
      stats[type] = (stats[type] || 0) + 1;
    });
    return stats;
  };

  const fetchAgreementTypes = async () => {
    const { data, error } = await supabase
      .from('agreements_2')
      .select('agreement_type')
      .not('agreement_type', 'is', null);

    if (error) {
      console.error('Failed to fetch agreement types:', error);
      return [];
    }

    const uniqueTypes = [...new Set(data.map(item => item.agreement_type))];
    return uniqueTypes.sort();
  };

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
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('university')
          .eq('email', user.email)
          .single();

        if (userError || !userData) {
          console.error('Failed to fetch user university');
          return;
        }

        setUniversityName(userData.university);
      }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!universityName) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('agreements_2')
        .select('*')
        .eq('university', universityName);

      if (error) {
        console.error('Failed to fetch agreements:', error.message);
        setAgreements([]);
      } else {
        setAgreements(data || []);
        setFilteredAgreements(data || []);
        setTypeStats(calculateTypeStats(data || []));
      }

      const types = await fetchAgreementTypes();
      setAgreementTypes(types);

      setLoading(false);
    };
    fetchData();
  }, [universityName]);

  useEffect(() => {
    let filtered = agreements;

    if (selectedType) {
      filtered = filtered.filter((item) =>
        item.agreement_type?.toLowerCase().includes(selectedType.toLowerCase())
      );
    }

    if (selectedYear) {
      filtered = filtered.filter((item) =>
        item.start_date?.startsWith(selectedYear)
      );
    }

    setFilteredAgreements(filtered);
    setTypeStats(calculateTypeStats(filtered));
  }, [selectedType, selectedYear, agreements]);

  const userName = userEmail ? userEmail.split('@')[0] : '';

  if (!userEmail || loading) return <div className="p-4 text-gray-600">Loading...</div>;

  return (
    <Sidebar role="partner" email={userEmail} userName={userName}>
      <div className="text-black space-y-6">
        <h1 className="text-3xl font-bold text-[#1F2163]">{universityName}</h1>

        {/* 统计信息 */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-3 text-[#1F2163]">Agreement Type Statistics</h2>
          <div className="flex flex-wrap gap-4">
            {Object.entries(typeStats).map(([type, count]) => (
              <div key={type} className="flex items-center bg-gray-50 px-3 py-2 rounded">
                <span className="font-medium text-gray-700">{type}:</span>
                <span className="ml-2 bg-[#1F2163] text-white px-2 py-1 rounded-full text-sm">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 筛选 */}
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600">Filter by Agreement Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="">All</option>
              {agreementTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600">Filter by Start Year:</label>
            <input
              type="text"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              placeholder="e.g. 2023"
              className="border rounded px-2 py-1"
            />
          </div>
        </div>

        {/* 协议列表 */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 max-h-[calc(100vh-250px)] overflow-y-auto">
          {filteredAgreements.length === 0 ? (
            <div className="bg-yellow-100 p-4 rounded border border-yellow-300">
              {agreements.length === 0 ? 'No agreements found for your university.' : 'No agreements match your filters.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAgreements.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><strong>Agreement Type:</strong> {item.agreement_type}</div>
                    
                    <div className="flex gap-4">
                      <div><strong>Start Date:</strong> {item.start_date}</div>
                      <div><strong>End Date:</strong> {item.end_date ?? '—'}</div>
                    </div>
                  </div>
                  <button
                    className="mt-4 px-4 py-2 bg-[#1F2163] text-white rounded hover:bg-[#3a3d95]"
                    onClick={() => router.push(`/partner/details-agreement?id=${item.id}`)}
                  >
                    View Full Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
