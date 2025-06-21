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
  const [modalOpen, setModalOpen] = useState(false);
  const [agreementDetails, setAgreementDetails] = useState(null);

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
  setAgreementDetails(agreement);
  setModalOpen(true);
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
                <TableRow className="bg-[#1F2163] text-white">
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
{modalOpen && agreementDetails && (
  <div className="fixed inset-0 bg-gradient-to-b from-[#692B2C] to-[#1F2163] flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-[#1F2163]">Agreement Details</h2>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          'contacts',
          'juc_member',
          'academic_collab',
          'jd_dd',
          'joint_lab',
          'co_teaching',
          'staff_mobility',
          'student_mobility',
          'joint_supervision',
          'research_collab',
          'joint_research',
          'joint_publication',
          'start_date',
          'end_date',
          'i_kohza',
          'pic_mjiit',
          'others'
        ].map((key) => {
          const value = agreementDetails[key];
          if (key === 'id') return null;

          const isAcademicField = ['jd_dd', 'joint_lab', 'staff_mobility', 'student_mobility', 'joint_supervision', 'co_teaching'].includes(key);
          const isResearchField = ['joint_research', 'joint_publication'].includes(key);

          if ((isAcademicField && !agreementDetails.academic_collab) || (isResearchField && !agreementDetails.research_collab)) {
            return null;
          }

          if (key === 'start_date' || key === 'end_date') {
            const date = value ? new Date(value) : new Date();

            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();

            return (
              <div key={key} className="col-span-full">
                <label className="text-sm text-gray-700 block mb-1">{key === 'start_date' ? 'Start Date' : 'End Date'}</label>
                <div className="flex gap-2">
                  <select
                    value={year}
                    disabled
                    className="border border-gray-300 rounded px-2 py-1"
                  >
                    {[...Array(401)].map((_, i) => (
                      <option key={i} value={new Date().getFullYear() - 200 + i}>{new Date().getFullYear() - 200 + i}</option>
                    ))}
                  </select>
                  <select
                    value={month}
                    disabled
                    className="border border-gray-300 rounded px-2 py-1"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                  <select
                    value={day}
                    disabled
                    className="border border-gray-300 rounded px-2 py-1"
                  >
                    {[...Array(31)].map((_, i) => (
                      <option key={i} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          }

          // Handle yes/no toggles (read-only)
          if (key === 'juc_member' || key === 'academic_collab' || key === 'research_collab') {
            const labelMap = {
              juc_member: 'JUC Member',
              academic_collab: 'Academic Collaboration',
              research_collab: 'Research Collaboration'
            };

            return (
              <div key={key} className="col-span-full">
                <label className="text-sm text-gray-700 block mb-1">{labelMap[key]}</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled
                    className={`px-4 py-2 rounded ${value === true ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    disabled
                    className={`px-4 py-2 rounded ${value === false ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    No
                  </button>
                </div>
              </div>
            );
          }

          // Render JSONB fields as read-only
          const renderJsonArrayEditor = (key, label, fields) => {
            let arr = [];
            try {
              arr = Array.isArray(value) ? value : JSON.parse(value) || [];
            } catch {
              arr = [];
            }

            return (
              <div key={key} className="col-span-full">
                <label className="text-sm text-gray-700 block mb-1">{label}</label>
                {arr.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center mb-2">
                    {fields.map((field, i) => (
                      <input
                        key={i}
                        type="text"
                        placeholder={field.replace(/_/g, ' ')}
                        value={item[field] || ''}
                        disabled
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                    ))}
                  </div>
                ))}
              </div>
            );
          };

          // === Handle JSON fields for Co-Teaching, Staff Mobility, etc. ===
          if (key === 'co_teaching') {
            return renderJsonArrayEditor('co_teaching', 'Co-Teaching', ['name', 'year']);
          }
          if (key === 'staff_mobility') {
            return renderJsonArrayEditor('staff_mobility', 'Staff Mobility', ['name', 'year']);
          }
          if (key === 'student_mobility') {
            return renderJsonArrayEditor('student_mobility', 'Student Mobility', ['name', 'year', 'number_of_students']);
          }
          if (key === 'joint_supervision') {
            return renderJsonArrayEditor('joint_supervision', 'Joint Supervision', ['name', 'year']);
          }
          if (key === 'joint_research') {
            return renderJsonArrayEditor('joint_research', 'Joint Research', ['name', 'year']);
          }
          if (key === 'joint_publication') {
            return renderJsonArrayEditor('joint_publication', 'Joint Publication', ['publisher', 'author', 'year']);
          }
          if (key === 'contacts') {
            return renderJsonArrayEditor('contacts', 'Contacts', ['name', 'email']);
          }
          if (key === 'others') {
            return renderJsonArrayEditor('others', 'Others', ['field', 'value']);
          }

          // Default for any other field
          return (
            <div key={key} className="col-span-full">
              <label className="text-sm text-gray-700 block mb-1">{key}</label>
              <textarea
                name={key}
                value={value ?? ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-y min-h-[80px]"
              />
            </div>
          );
        })}
      </div>
      <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
        <button
          onClick={() => setModalOpen(false)}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
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