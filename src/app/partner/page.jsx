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
  const [agreementTypes, setAgreementTypes] = useState([]); // 新增：存储所有协议类型

  const [selectedType, setSelectedType] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const router = useRouter();

  // 计算协议类型统计
  const calculateTypeStats = (agreements) => {
    const stats = {};
    agreements.forEach(agreement => {
      const type = agreement.agreement_type || 'Unknown';
      stats[type] = (stats[type] || 0) + 1;
    });
    return stats;
  };

  // 获取所有协议类型
  const fetchAgreementTypes = async () => {
    const { data, error } = await supabase
      .from('agreements_2')
      .select('agreement_type')
      .not('agreement_type', 'is', null);

    if (error) {
      console.error('Failed to fetch agreement types:', error);
      return [];
    }

    // 去重并排序
    const uniqueTypes = [...new Set(data.map(item => item.agreement_type))];
    return uniqueTypes.sort();
  };

  // 1. 获取用户信息
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
        // 同时获取用户所属大学
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

  // 2. 获取该大学所有协议数据和协议类型
  useEffect(() => {
    const fetchData = async () => {
      if (!universityName) return;
      setLoading(true);

      // 获取协议数据
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

      // 获取所有协议类型选项
      const types = await fetchAgreementTypes();
      setAgreementTypes(types);

      setLoading(false);
    };
    fetchData();
  }, [universityName]);

  // 3. 根据筛选项更新 filteredAgreements
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#1F2163]">
            {universityName}
          </h1>
          
        </div>

        {/* 协议类型统计视图 */}
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
                    <div><strong>Academic Collaboration:</strong> {item.academic_collab}</div>
                    <div><strong>Research Collaboration:</strong> {item.research_collab}</div>
                    <div className="flex gap-4">
                      <div><strong>Start Date:</strong> {item.start_date}</div>
                      <div><strong>End Date:</strong> {item.end_date ?? '—'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}