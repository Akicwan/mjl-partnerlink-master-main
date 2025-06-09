'use client';
import '../../globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default function AgreementsPage() {
  const [userEmail, setUserEmail] = useState(null);
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDeleted, setLastDeleted] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedAgreement, setEditedAgreement] = useState({});
  const router = useRouter();

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
    const fetchAgreements = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('agreements_2').select('*');
      if (error) {
        console.error("Error fetching agreement data:", error);
        setAgreements([]);
      } else {
        // Sort agreements alphabetically by university name
        const sortedAgreements = [...data].sort((a, b) => 
          a.university.localeCompare(b.university)
        );
        setAgreements(sortedAgreements);
      }
      setLoading(false);
    };
    if (userEmail) fetchAgreements();
  }, [userEmail]);

  const handleRowClick = (agreement) => {
    setSelectedAgreement(agreement);
    setEditedAgreement(agreement);
    setEditMode(false);
  };

  const handleAdd = () => {
    router.push('/admin/form');
  };

  const handleDelete = async (id) => {
    const agreementToDelete = agreements.find(item => item.id === id);
    if (!confirm(`Are you sure you want to delete the agreement with ${agreementToDelete.university}?`)) return;

    const { error } = await supabase.from('agreements_2').delete().eq('id', id);
    if (!error) {
      setLastDeleted(agreementToDelete);
      setAgreements(prev => prev.filter(item => item.id !== id));
      setSelectedAgreement(null);
      setTimeout(() => setLastDeleted(null), 5000);
    } else {
      console.error("Delete failed:", error.message);
    }
  };

  const handleUndo = async () => {
    if (lastDeleted) {
      const { error } = await supabase.from('agreements_2').insert([lastDeleted]);
      if (!error) {
        setAgreements(prev => [lastDeleted, ...prev]);
        setLastDeleted(null);
      } else {
        console.error("Undo failed:", error.message);
      }
    }
  };

  const handleSaveEdit = async () => {
    const { error } = await supabase
      .from('agreements_2')
      .update(editedAgreement)
      .eq('id', editedAgreement.id);

    if (!error) {
      setAgreements(prev =>
        prev.map(item => item.id === editedAgreement.id ? editedAgreement : item)
      );
      setSelectedAgreement(editedAgreement);
      setEditMode(false);
    } else {
      console.error("Update failed:", error.message);
    }
  };

  const filteredAgreements = [...agreements].filter(item => {
    const matchesQuery = item.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.agreement_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || item.agreement_type === filterType;
    return matchesQuery && matchesType;
  });

  if (!userEmail || loading) return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1F2163]"></div></div>;

  return (
    <Sidebar role="admin" email={userEmail}>
      <div className="relative text-black p-6 bg-white rounded-2xl shadow-lg">
  {/* Updated Heading with Gradient Background */}
  <div className="bg-gradient-to-r from-[#1F2163] to-[#161A42] p-6 rounded-xl shadow-lg mb-6">
    <h1 className="text-2xl font-bold text-white">Agreements Management</h1>
    <p className="text-blue-100 mt-1">View and manage all university agreements</p>
  </div>

  {/* Rest of the content remains the same */}
  <div className="flex justify-between items-center mb-6">
  </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative w-full md:w-1/2">
            <input
              type="text"
              placeholder="🔍 Search by university or type..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D9AC42] focus:border-[#D9AC42] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative w-full md:w-1/2">
            <select
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-[#D9AC42] focus:border-[#D9AC42] bg-white transition-all"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Agreement Types</option>
              <option value="MOA">MOA</option>
              <option value="MOU">MOU</option>
              <option value="Exchange Agreement">Exchange Agreement</option>
              <option value="Agreement">Agreement</option>
              <option value="Academic Agreement">Academic Agreement</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-[#1F2163]">{filteredAgreements.length}</span> of <span className="font-semibold">{agreements.length}</span> agreements
          </p>
          {lastDeleted && (
            <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg shadow-sm">
              <span>Agreement with {lastDeleted.university} deleted. </span>
              <button 
                onClick={handleUndo} 
                className="text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Undo
              </button>
            </div>
          )}
        </div>

        {filteredAgreements.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-lg">No agreements found matching your criteria</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-white text-[#1F2163]">
                    <TableHead className="text-[#1F2163] uppercase font-bold py-3">University</TableHead>
                    <TableHead className="text-[#1F2163] uppercase font-bold">Type</TableHead>
                    <TableHead className="text-[#1F2163] uppercase font-bold">Start Date</TableHead>
                    <TableHead className="text-[#1F2163] uppercase font-bold">End Date</TableHead>
                    <TableHead className="text-[#1F2163] uppercase font-bold">Status</TableHead>
                    <TableHead className="text-[#1F2163] uppercase font-bold text-right">Actions</TableHead>

                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgreements.map((item, idx) => (
                    <TableRow
                      key={idx}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition ${selectedAgreement?.id === item.id ? 'bg-blue-50' : ''}`}
                      onClick={() => handleRowClick(item)}
                    >
                      <TableCell className="py-3 font-medium text-gray-900">
                        {item.university}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.agreement_type}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(item.start_date).toLocaleDateString('en-MY')}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(item.end_date).toLocaleDateString('en-MY')}
                      </TableCell>
                     <TableCell>
                    {new Date(item.end_date) < new Date() ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Expired
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </TableCell>  

                      <TableCell className="text-right">

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-all">
          <div className="bg-white w-[90vw] max-w-5xl max-h-[90vh] overflow-y-auto p-8 rounded-xl shadow-xl relative">
            <button
              onClick={() => setSelectedAgreement(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
            >
              ×
            </button>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1F2163]">
                Agreement Details
              </h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-[#1F2163] text-white py-2 px-4 rounded-lg hover:bg-[#0f1856] transition"
                >
                  Edit
                </button>
              )}
            </div>

            {/* Keep the modal content exactly as in your original code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              {Object.entries(editedAgreement).map(([key, value]) => {
                if (['id', 'contacts', 'others'].includes(key)) return null;

                // Date fields
                if (key === 'start_date' || key === 'end_date') {
                  const label = key === 'start_date' ? 'Start Date' : 'End Date';
                  return (
                    <div key={key} className="flex flex-col">
                      <label className="block font-medium text-gray-700 mb-1">
                        {label}
                      </label>
                      {editMode ? (
                        <DatePicker
                          selected={value ? new Date(value) : null}
                          onChange={(date) => setEditedAgreement(prev => ({ ...prev, [key]: date }))}
                          dateFormat="dd MMM yyyy"
                          showYearDropdown
                          scrollableYearDropdown
                          className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D9AC42] w-full"
                        />
                      ) : (
                        <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded">
                          {value ? new Date(value).toLocaleDateString() : '-'}
                        </p>
                      )}
                    </div>
                  );
                }

                // Dropdown fields
                if (key === 'agreement_type') {
                  const agreementTypes = [
                    'MOA', 'MOA Regional Conference Program Agreement', 'MOU', 'Cross Appointment',
                    'Academic Cooperation', 'Outsourcing Agreement', 'Satellite Office', 'Exchange Agreement',
                    'Agreement', 'Academic Agreement', 'Collaborative Research Agreement Biological Soil Crust (BSC)',
                    'LOA & Outsourcing Agreement (two agreement types)', 'CRA', 'SEA', 'LOA', 'LOC', 'LOI', 'JRA'
                  ];
                  return (
                    <div key={key} className="flex flex-col">
                      <label className="text-gray-700 font-medium mb-1">Agreement Type</label>
                      {editMode ? (
                        <select
                          value={value || ''}
                          onChange={(e) => setEditedAgreement(prev => ({ ...prev, [key]: e.target.value }))}
                          className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D9AC42] w-full"
                        >
                          <option value="" disabled>Select Agreement Type</option>
                          {agreementTypes.map((type, idx) => (
                            <option key={idx} value={type}>{type}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded">{value || '-'}</p>
                      )}
                    </div>
                  );
                }

                // Boolean fields
                if (['juc_member', 'academic_collab', 'research_collab'].includes(key)) {
                  return (
                    <div key={key} className="flex flex-col">
                      <label className="text-gray-700 font-medium mb-1">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      {editMode ? (
                        <select
                          value={value ? 'yes' : 'no'}
                          onChange={(e) => setEditedAgreement(prev => ({ ...prev, [key]: e.target.value === 'yes' }))}
                          className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D9AC42] w-full"
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      ) : (
                        <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded">{value ? 'Yes' : 'No'}</p>
                      )}
                    </div>
                  );
                }

                // Array fields
                const listFields = {
                  staff_mobility: item => `• ${item.name} (${item.year})`,
                  student_mobility: item => `• ${item.name} (${item.year}) - ${item.number_of_students} students`,
                  joint_supervision: item => `• ${item.name} (${item.year})`,
                  joint_research: item => `• ${item.name} (${item.year})`,
                  joint_publication: item => `• ${item.publisher} - ${item.author} (${item.year})`,
                  co_teaching: item => `• ${item.name} (${item.year})`
                };

                if (listFields[key] && Array.isArray(value)) {
                  return (
                    <div key={key} className="flex flex-col">
                      <label className="text-gray-700 font-medium mb-1">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      {value.length > 0 ? (
                        <ul className="bg-gray-50 px-3 py-2 rounded text-gray-800 space-y-1 max-h-32 overflow-y-auto border border-gray-200">
                          {value.map((item, index) => (
                            <li key={index}>{listFields[key](item)}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="bg-gray-50 px-3 py-2 rounded text-gray-800 border border-gray-200">-</p>
                      )}
                    </div>
                  );
                }

                // Default fields
                return (
                  <div key={key} className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => setEditedAgreement(prev => ({ ...prev, [key]: e.target.value }))}
                        className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D9AC42] w-full"
                      />
                    ) : (
                      <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded border border-gray-200">{value || '-'}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-200">
              {editMode ? (
                <button 
                  onClick={handleSaveEdit} 
                  className="bg-[#D9AC42] text-white py-2 px-6 rounded-lg hover:bg-[#c3932d] transition"
                >
                  Save Changes
                </button>
              ) : null}
              <button
                onClick={() => setSelectedAgreement(null)}
                className="bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 transition"
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