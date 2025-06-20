'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

import { FiInfo, FiCheckCircle, FiUsers, FiBook, FiBookmark, FiLayers } from 'react-icons/fi';



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
  const [selectedAgreement, setSelectedAgreement] = useState(null);
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

  const handleRowClick = (agreement) => {
    setSelectedAgreement(agreement);
  };

  const userName = userEmail ? userEmail.split('@')[0] : '';

  if (!userEmail || loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1F2163]"></div>
    </div>
  );

  return (
    <Sidebar role="partner" email={userEmail} userName={userName}>
      <div className="p-6 space-y-8">
        {/* Header with University Name */}
        <div className="bg-gradient-to-r from-[#1F2163] to-[#161A42] p-6 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-white">{universityName}</h1>
          <p className="text-blue-100">Partner Dashboard</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(typeStats).map(([type, count]) => {
            let icon;
            switch(type) {
              case 'Staff Mobility': icon = <FiUsers className="text-[#D9AC42]" size={20} />; break;
              case 'Student Mobility': icon = <FiUsers className="text-[#D9AC42]" size={20} />; break;
              case 'Joint Research': icon = <FiBook className="text-[#D9AC42]" size={20} />; break;
              case 'Joint Publication': icon = <FiBookmark className="text-[#D9AC42]" size={20} />; break;
              case 'Co-Teaching': icon = <FiLayers className="text-[#D9AC42]" size={20} />; break;
            }
            
            return (
              <div key={type} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{type}</p>
                    <p className="text-2xl font-bold text-[#1F2163]">{count}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-[#1F2163] flex items-center gap-2">
           Filter Agreements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Agreement Type</label>
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-[#D9AC42] focus:border-[#D9AC42]"
                >
                  <option value="">All Types</option>
                  {agreementTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Year</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
           
                </div>
                <input
                  type="text"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  placeholder="e.g. 2023"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-[#D9AC42] focus:border-[#D9AC42]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Agreements Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {filteredAgreements.length === 0 ? (
            <div className="p-8 text-center">
              <FiInfo className="mx-auto text-gray-400 mb-2" size={24} />
              <p className="text-gray-500">
                {agreements.length === 0 
                  ? 'No agreements found for your university.' 
                  : 'No agreements match your filters.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-[#1F2163] text-white hover:bg-[#1F2163]">
                  <TableHead className="text-white">Agreement Type</TableHead>
                  <TableHead className="text-white">Start Date</TableHead>
                  <TableHead className="text-white">End Date</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgreements.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => handleRowClick(item)}
                  >
                    <TableCell className="font-medium">{item.agreement_type || '-'}</TableCell>
                    <TableCell>{item.start_date ? new Date(item.start_date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{item.end_date ? new Date(item.end_date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      {item.end_date && new Date(item.end_date) < new Date() ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FiCheckCircle className="mr-1" /> Active
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Agreement Details Modal */}
      {selectedAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white w-[90vw] max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="bg-gradient-to-r from-[#1F2163] to-[#161A42] p-6 text-white">
              <h2 className="text-2xl font-bold">Agreement Details</h2>
              <p className="text-blue-100">{selectedAgreement.agreement_type || 'Agreement'}</p>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(selectedAgreement).map(([key, value]) => {
          if (key === 'id' || key === 'contacts' || key === 'others') return null;

          if (key === 'start_date' || key === 'end_date') {
            const label = key === 'start_date' ? 'Start Date' : 'End Date';
            return (
              <div key={key} className="flex flex-col">
                <label className="block font-medium text-black mb-1">
                  {label}
                </label>
                <p className="text-gray-800 bg-gray-100 px-3 py-2 rounded">
                  {value ? new Date(value).toLocaleDateString() : '-'}
                </p>
              </div>
            );
          }

          if (key === 'agreement_type') {
            return (
              <div key={key} className="flex flex-col">
                <label className="text-[#1F2163] font-medium capitalize mb-1">
                  Agreement Type:
                </label>
                <p className="text-gray-800 bg-gray-100 px-3 py-2 rounded">
                  {value || '-'}
                </p>
              </div>
            );
          }

          if (['juc_member', 'academic_collab', 'research_collab'].includes(key)) {
            return (
              <div key={key} className="flex flex-col">
                <label className="text-[#1F2163] font-medium capitalize mb-1">
                  {key.replace(/_/g, ' ')}:
                </label>
                <p className="text-gray-800 bg-gray-100 px-3 py-2 rounded">
                  {value ? 'Yes' : 'No'}
                </p>
              </div>
            );
          }

         if (key === 'staff_mobility' && Array.isArray(value)) {
  return (
    <div key={key} className="flex flex-col">
      <label className="text-[#1F2163] font-medium capitalize mb-1">Staff Mobility:</label>
      {value.length > 0 ? (
        <ul className="bg-gray-100 px-3 py-2 rounded text-gray-800 space-y-1 max-h-32 overflow-y-auto">
          {value.map((item, index) => (
            <li key={index}>• {item.name} ({item.year})</li>
          ))}
        </ul>
      ) : (
        <p className="bg-gray-100 px-3 py-2 rounded text-gray-800">-</p>
      )}
    </div>
  );
}

if (key === 'student_mobility' && Array.isArray(value)) {
  return (
    <div key={key} className="flex flex-col">
      <label className="text-[#1F2163] font-medium capitalize mb-1">Student Mobility:</label>
      {value.length > 0 ? (
        <ul className="bg-gray-100 px-3 py-2 rounded text-gray-800 space-y-1 max-h-32 overflow-y-auto">
          {value.map((item, index) => (
            <li key={index}>
              • {item.name} ({item.year}) - {item.number_of_students} students
            </li>
          ))}
        </ul>
      ) : (
        <p className="bg-gray-100 px-3 py-2 rounded text-gray-800">-</p>
      )}
    </div>
  );
}

if (key === 'joint_supervision' && Array.isArray(value)) {
  return (
    <div key={key} className="flex flex-col">
      <label className="text-[#1F2163] font-medium capitalize mb-1">Joint Supervision:</label>
      {value.length > 0 ? (
        <ul className="bg-gray-100 px-3 py-2 rounded text-gray-800 space-y-1 max-h-32 overflow-y-auto">
          {value.map((item, index) => (
            <li key={index}>• {item.name} ({item.year})</li>
          ))}
        </ul>
      ) : (
        <p className="bg-gray-100 px-3 py-2 rounded text-gray-800">-</p>
      )}
    </div>
  );
}

if (key === 'joint_research' && Array.isArray(value)) {
  return (
    <div key={key} className="flex flex-col">
      <label className="text-[#1F2163] font-medium capitalize mb-1">Joint Research:</label>
      {value.length > 0 ? (
        <ul className="bg-gray-100 px-3 py-2 rounded text-gray-800 space-y-1 max-h-32 overflow-y-auto">
          {value.map((item, index) => (
            <li key={index}>• {item.name} ({item.year})</li>
          ))}
        </ul>
      ) : (
        <p className="bg-gray-100 px-3 py-2 rounded text-gray-800">-</p>
      )}
    </div>
  );
}

if (key === 'joint_publication' && Array.isArray(value)) {
  return (
    <div key={key} className="flex flex-col">
      <label className="text-[#1F2163] font-medium capitalize mb-1">Joint Publication:</label>
      {value.length > 0 ? (
        <ul className="bg-gray-100 px-3 py-2 rounded text-gray-800 space-y-1 max-h-32 overflow-y-auto">
          {value.map((item, index) => (
            <li key={index}>
              • {item.publisher} - {item.author} ({item.year})
            </li>
          ))}
        </ul>
      ) : (
        <p className="bg-gray-100 px-3 py-2 rounded text-gray-800">-</p>
      )}
    </div>
  );
}

if (key === 'co_teaching' && Array.isArray(value)) {
  return (
    <div key={key} className="flex flex-col">
      <label className="text-[#1F2163] font-medium capitalize mb-1">Co Teaching:</label>
      {value.length > 0 ? (
        <ul className="bg-gray-100 px-3 py-2 rounded text-gray-800 space-y-1 max-h-32 overflow-y-auto">
          {value.map((item, index) => (
            <li key={index}>• {item.name} ({item.year})</li>
          ))}
        </ul>
      ) : (
        <p className="bg-gray-100 px-3 py-2 rounded text-gray-800">-</p>
      )}
    </div>
  );
}


          // 🛠️ Fallback rendering for any other key
          return (
            <div key={key} className="flex flex-col">
              <label className="text-[#1F2163] font-medium capitalize mb-1">
                {key.replace(/_/g, ' ')}:
              </label>
              <p className="text-gray-800 bg-gray-100 px-3 py-2 rounded whitespace-pre-wrap">
                {typeof value === 'object' && value !== null
                  ? Array.isArray(value)
                    ? value.map((v) => (typeof v === 'object' ? JSON.stringify(v) : v)).join(', ')
                    : Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ')
                  : value ?? '-'}
              </p>
            </div>
          );
        })}
      </div>

      <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedAgreement(null)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}