'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

  if (!userEmail || loading) return <div className="p-4 text-gray-600">Loading...</div>;

  return (
    <Sidebar role="partner" email={userEmail} userName={userName}>
      <div className="text-black space-y-6">
        <h1 className="text-3xl font-bold text-[#1F2163]">{universityName}</h1>

        {/* Statistics */}
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

        {/* Filters */}
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

        {/* Agreements Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          {filteredAgreements.length === 0 ? (
            <div className="bg-yellow-100 p-4 rounded border border-yellow-300">
              {agreements.length === 0 ? 'No agreements found for your university.' : 'No agreements match your filters.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f3f4f6] text-[#1F2163]">
                  <TableHead>Agreement Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgreements.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => handleRowClick(item)}
                  >
                    <TableCell>{item.agreement_type || '-'}</TableCell>
                    <TableCell>{item.start_date ? new Date(item.start_date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{item.end_date ? new Date(item.end_date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      {item.end_date && new Date(item.end_date) < new Date() ? 'Expired' : 'Active'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-md transition-all">
          <div className="bg-white w-[90vw] max-w-5xl max-h-[90vh] overflow-y-auto p-8 rounded-2xl shadow-2xl relative">
            <h2 className="text-2xl font-bold text-[#1F2163] mb-6 border-b pb-3">
              Agreement Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
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

                if (
                  [
                    'joint_lab', 'co_teaching', 'staff_mobility', 'student_mobility',
                    'joint_supervision', 'joint_publication', 'pic_mjiit', 'joint_research'
                  ].includes(key)
                ) {
                  return (
                    <div key={key} className="flex flex-col">
                      <label className="text-[#1F2163] font-medium capitalize mb-1">
                        {key.replace(/_/g, ' ')}:
                      </label>
                      <p className="text-gray-800 bg-gray-100 px-3 py-2 rounded whitespace-pre-wrap">
                        {value ?? '-'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div key={key} className="flex flex-col">
                    <label className="text-[#1F2163] font-medium capitalize mb-1">
                      {key.replace(/_/g, ' ')}:
                    </label>
                    <p className="text-gray-800 bg-gray-100 px-3 py-2 rounded">{value ?? '-'}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setSelectedAgreement(null)}
                className="bg-gray-300 text-gray-700 py-2 px-6 rounded hover:bg-gray-400"
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