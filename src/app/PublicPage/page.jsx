'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabaseClient';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function PublicDashboard() {
  const router = useRouter();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAgreements: 0,
    activeAgreements: 0,
    expiredAgreements: 0,
    agreementTypes: {},
    universities: {}
  });

  const [activityCounts, setActivityCounts] = useState({
    student_mobility: 0,
    staff_mobility: 0,
    joint_research_publication: 0,
    co_teaching_supervision: 0
  });

  useEffect(() => {
    const fetchAgreements = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('agreements_2').select('*');

      if (error) {
        console.error("Error fetching agreement data:", error);
        setAgreements([]);
      } else {
        const sortedAgreements = [...data].sort((a, b) =>
          a.university.localeCompare(b.university)
        );
        setAgreements(sortedAgreements);
        calculateStats(sortedAgreements);
      }
      setLoading(false);
    };

    fetchAgreements();
  }, []);

  const calculateStats = (agreements) => {
  const today = new Date();
  const typeCounts = {};
  const universityCounts = {};

  let active = 0;
  let expired = 0;

  let studentTotal = 0;
  let staffTotal = 0;
  let researchTotal = 0;
  let publicationTotal = 0;
  let coTeachingTotal = 0;
  let supervisionTotal = 0;

  agreements.forEach((agreement) => {
    const type = agreement.agreement_type || 'Other';
    typeCounts[type] = (typeCounts[type] || 0) + 1;

    const university = agreement.university || 'Unknown';
    universityCounts[university] = (universityCounts[university] || 0) + 1;

    if (agreement.end_date) {
      const endDate = new Date(agreement.end_date);
      if (endDate < today) expired++;
      else active++;
    }

    const parseArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    // Student Mobility
    const studentMobility = parseArray(agreement.student_mobility);
    studentMobility.forEach(({ number_of_students }) => {
      studentTotal += parseInt(number_of_students) || 0;
    });

    // Staff Mobility
    const staffMobility = parseArray(agreement.staff_mobility);
    staffMobility.forEach(() => {
      staffTotal += 1;
    });

    // Joint Research
    const jointResearch = parseArray(agreement.joint_research);
    researchTotal += jointResearch.length;

    // Joint Publications
    const jointPublication = parseArray(agreement.joint_publication);
    publicationTotal += jointPublication.length;

    // Co-Teaching
    const coTeaching = parseArray(agreement.co_teaching);
    coTeachingTotal += coTeaching.length;

    // Joint Supervision
    const jointSupervision = parseArray(agreement.joint_supervision);
    supervisionTotal += jointSupervision.length;
  });

  setStats({
    totalAgreements: agreements.length,
    activeAgreements: active,
    expiredAgreements: expired,
    agreementTypes: typeCounts,
    universities: universityCounts
  });

  setActivityCounts({
    student_mobility: studentTotal,
    staff_mobility: staffTotal,
    joint_research_publication: researchTotal + publicationTotal,
    co_teaching_supervision: coTeachingTotal + supervisionTotal
  });
};




  const getTopItems = (items, count = 5) => {
    return Object.entries(items)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([name, value]) => ({ name, value }));
  };

  const pieData = [
    { name: 'Student Mobility', value: activityCounts.student_mobility },
    { name: 'Staff Mobility', value: activityCounts.staff_mobility },
    { name: 'Joint Research & Publications', value: activityCounts.joint_research_publication },
    { name: 'Co-Teaching & Supervision', value: activityCounts.co_teaching_supervision }
  ];

  const COLORS = ['#a0c4ff', '#ffd6a5', '#bdb2ff', '#ffadad'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#692B2C] to-[#1F2163] p-4">
      {/* Top Navigation Bar */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center py-4 px-0">
          <div className="flex items-center space-x-2">
            <span className="text-white text-2xl">
              <img
                src="/partnerlink.png"
                alt="PartnerLink Logo"
                className="h-25 w-auto object-contain"
              />
            </span>
            <h1 className="text-3xl font-bold text-white">MJL PartnerLink</h1>
          </div>
          <div className="flex items-center space-x-4">
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto mt-0">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#1F2163] to-[#3A3F9E] text-white p-8 rounded-t-2xl shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome to MJL PartnerLink</h1>
              <p className="text-lg opacity-90">Explore our global partnerships and collaborations</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={() => router.push('/login')}
                className="flex items-center bg-[#D9AC42] text-[#1F2163] px-7 py-2 rounded-lg shadow hover:bg-[#c6983b] transition-colors font-medium"
              >
                <span className="mr-2"></span>Login
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="bg-white rounded-b-2xl shadow-xl p-6 md:p-8">
          {/* Top Row - Map and Side Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Map Container - Now takes 2/3 width */}
            <div className="lg:col-span-2">
              <div className="bg-#fae7d4 border border-[#e1d9c4] p-6 rounded-2xl shadow-xl h-full">
                <div className="flex items-center mb-4">
                  <span className="text-[#D9AC42] text-2xl mr-3">🗺️</span>
                  <h2 className="text-2xl font-bold text-[#1F2163] tracking-tight">Exploring Our Partnership Activities</h2>
                </div>

                <div className="w-full h-96 rounded-xl border border-[#e1d9c4] bg-white shadow-inner flex items-center justify-center" style={{width: '100%', height: 430}}>
                   <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={200}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

                </div>

                <div className="mt-4 text-sm text-gray-600 text-right italic">
                  Piechart highlights our total acitivities.
                </div>
              </div>
            </div>

            {/* Side Panel - Now takes 1/3 width */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-inner border border-[#e1d9c4] space-y-6 h-full">
                {/* What is MJL PartnerLink */}
                <div className="bg-[#fff7e8] p-4 rounded-lg border border-[#e5c89c] shadow-sm">
                  <h3 className="text-lg font-semibold text-[#1F2163] mb-2 flex items-center">
                    <span className="mr-2 text-[#D9AC42]">🌍</span> What is MJL PartnerLink?
                  </h3>
                  <p className="text-sm text-[#3c2e1f] leading-relaxed">
                    MJL PartnerLink is a collaboration management system designed for the MJIIT Japan Linkage Office. It centralizes agreements, activities and university collaborations on a unified platform.
                  </p>
                </div>

                {/* Partner Institutions */}
                <div className="bg-[#fbe9e5] p-4 rounded-lg border border-[#e9c6bd] shadow-sm">
                  <h3 className="text-lg font-semibold text-[#1F2163] mb-2 flex items-center">
                    <span className="mr-2 text-[#D9AC42]">🏛️</span> Partner Institutions
                  </h3>
                  <p className="text-sm text-[#3c2e1f] leading-relaxed">
                    MJIIT partners with top universities globally. Each institution manages MOUs, MOAs and academic or research collaborations through this system.
                  </p>
                </div>

                {/* Types of Agreements */}
                <div className="bg-[#ece8f6] p-4 rounded-lg border border-[#cbc4e6] shadow-sm">
                  <h3 className="text-lg font-semibold text-[#1F2163] mb-2 flex items-center">
                    <span className="mr-2 text-[#D9AC42]">📑</span> Types of Agreements
                  </h3>
                  <p className="text-sm text-[#3c2e1f] leading-relaxed">
                    Types include MOU, MOA, LOI, Exchange Agreement, Outsourcing Agreement, CRA, SEA and more. Agreements are grouped under their respective partner universities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Section - Full width below */}
          <div className="bg-white border border-[#e1d9c4] rounded-2xl shadow-xl p-6">
            <div className="flex items-center mb-4">
              <span className="text-[#D9AC42] text-2xl mr-3">📊</span>
              <h2 className="text-2xl font-bold text-[#1F2163] tracking-tight">Partnership Statistics</h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1F2163]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Summary Stats */}
                <div className="bg-[#f8f9fa] p-4 rounded-xl border border-[#e1d9c4]">
                  <h3 className="text-lg font-semibold text-[#1F2163] mb-3">Overview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Agreements:</span>
                      <span className="font-bold text-[#1F2163]">{stats.totalAgreements}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Active Agreements:</span>
                      <span className="font-bold text-green-600">{stats.activeAgreements}</span>
                    </div>
                    
                  </div>
                </div>

                {/* Top Agreement Types */}
                <div className="bg-[#f8f9fa] p-4 rounded-xl border border-[#e1d9c4]">
                  <h3 className="text-lg font-semibold text-[#1F2163] mb-3">Top Agreement Types</h3>
                  <div className="space-y-2">
                    {getTopItems(stats.agreementTypes).map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-600 truncate">{item.name}:</span>
                        <span className="font-bold text-[#1F2163]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Universities - Full width */}
                <div className="bg-[#f8f9fa] p-4 rounded-xl border border-[#e1d9c4] md:col-span-2">
                  <h3 className="text-lg font-semibold text-[#1F2163] mb-3">Partner Universities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {getTopItems(stats.universities).map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-[#e1d9c4] text-center">
                        <div className="text-sm font-medium text-gray-600">{item.name}</div>
                        <div className="text-xl font-bold text-[#1F2163] mt-1">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}