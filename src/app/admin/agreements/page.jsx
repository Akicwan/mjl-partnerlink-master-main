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
        setAgreements(data);
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

  const filteredAgreements = agreements.filter(item => {
    const matchesQuery = item.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.agreement_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || item.agreement_type === filterType;
    return matchesQuery && matchesType;
  });

  if (!userEmail || loading) return <p className="p-6">Loading...</p>;

  const renderField = (label, key) => (
    <div className="mb-2">
      <p className="font-semibold">{label}:</p>
      {editMode ? (
        <input
          className="w-full px-2 py-1 border border-gray-300 rounded"
          value={editedAgreement[key] || ''}
          onChange={(e) => setEditedAgreement({ ...editedAgreement, [key]: e.target.value })}
        />
      ) : (
        <p>{selectedAgreement[key]}</p>
      )}
    </div>
  );
  

  return (
    <Sidebar role="admin" email={userEmail}>
      <div className="relative text-black p-6 bg-white rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#1F2163]">Agreements</h1>
          <button
            onClick={handleAdd}
            className="bg-[#D9AC42] text-white px-4 py-2 rounded hover:bg-[#c3932d]"
          >
            + Add Agreement
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by university..."
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="MOA">MOA</option>
            <option value="MOU">MOU</option>
            <option value="Exchange Agreement">Exchange Agreement</option>
            <option value="Agreement">Agreement</option>
            <option value="Academic Agreement">Academic Agreement</option>
          </select>
        </div>

        {/* Stats */}
        <p className="mb-4 text-sm text-gray-600">Showing {filteredAgreements.length} of {agreements.length} agreements</p>

        {lastDeleted && (
          <div className="bg-yellow-100 text-yellow-800 p-4 mb-4 rounded shadow">
            <span>Agreement with {lastDeleted.university} deleted. </span>
            <button onClick={handleUndo} className="underline text-blue-600 hover:text-blue-800">Undo</button>
          </div>
        )}

        {filteredAgreements.length === 0 ? (
          <p>No agreements found.</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f3f4f6] text-[#1F2163]">
                  <TableHead>University</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgreements.map((item, idx) => (
                  <TableRow
                    key={idx}
                    className="hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => handleRowClick(item)}
                  >
                    <TableCell>{item.university}</TableCell>
                    <TableCell>{item.agreement_type}</TableCell>
                    <TableCell>{new Date(item.start_date).toLocaleDateString('en-MY')}</TableCell>
                    <TableCell>{new Date(item.end_date).toLocaleDateString('en-MY')}</TableCell>
                    <TableCell>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Modal */}
{selectedAgreement && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-md transition-all">
    <div className="bg-white w-[90vw] max-w-5xl max-h-[90vh] overflow-y-auto p-8 rounded-2xl shadow-2xl relative">
      <h2 className="text-2xl font-bold text-[#1F2163] mb-6 border-b pb-3">
        Agreement Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        {Object.entries(editedAgreement).map(([key, value]) => {
          if (key === 'id' || key === 'contacts' || key === 'others') return null;

          if (key === 'start_date' || key === 'end_date') {
            const label = key === 'start_date' ? 'Start Date' : 'End Date';
            return (
              <div key={key} className="flex flex-col">
                <label className="block font-medium text-black mb-1">
                  {label}<span className="text-red-500">*</span>
                </label>
                {editMode ? (
                  <DatePicker
                    selected={value ? new Date(value) : null}
                    onChange={(date) => setEditedAgreement({ ...editedAgreement, [key]: date })}
                    dateFormat="dd MMM yyyy"
                    showYearDropdown
                    scrollableYearDropdown
                    className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D9AC42]"
                  />
                ) : (
                  <p className="text-gray-800 bg-gray-100 px-3 py-2 rounded">
                    {value ? new Date(value).toLocaleDateString() : '-'}
                  </p>
                )}
              </div>
            );
          }

          if (key === 'agreement_type') {
            const agreementTypes = [
              'MOA', 'MOA Regional Conference Program Agreement', 'MOU', 'Cross Appointment',
              'Academic Cooperation', 'Outsourcing Agreement', 'Satellite Office', 'Exchange Agreement',
              'Agreement', 'Academic Agreement', 'Collaborative Research Agreement Biological Soil Crust (BSC)',
              'LOA & Outsourcing Agreement (two agreement types)', 'CRA', 'SEA', 'LOA', 'LOC', 'LOI', 'JRA'
            ];

            return (
              <div key={key} className="flex flex-col">
                <label className="text-[#1F2163] font-medium capitalize mb-1">
                  Agreement Type:
                </label>
                {editMode ? (
                  <select
                    value={value || ''}
                    onChange={(e) => setEditedAgreement({ ...editedAgreement, [key]: e.target.value })}
                    className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D9AC42]"
                  >
                    <option value="" disabled>Select Agreement Type</option>
                    {agreementTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-800 bg-gray-100 px-3 py-2 rounded">
                    {value || '-'}
                  </p>
                )}
              </div>
            );
          }

          if (['juc_member', 'academic_collab', 'research_collab'].includes(key)) {
            return (
              <div key={key} className="flex flex-col">
                <label className="text-[#1F2163] font-medium capitalize mb-1">
                  {key.replace(/_/g, ' ')}:
                </label>
                {editMode ? (
                  <select
                    value={value ? 'Yes' : 'No'}
                    onChange={(e) => setEditedAgreement({ ...editedAgreement, [key]: e.target.value === 'Yes' })}
                    className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D9AC42]"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                ) : (
                  <p className="text-gray-800 bg-gray-100 px-3 py-2 rounded">
                    {value ? 'Yes' : 'No'}
                  </p>
                )}
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
                {editMode ? (
                  <textarea
                    value={value ?? ''}
                    onChange={(e) => setEditedAgreement({ ...editedAgreement, [key]: e.target.value })}
                    className="border border-gray-300 px-4 py-2 rounded-md resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[#D9AC42]"
                  />
                ) : (
                  <p className="text-gray-800 bg-gray-100 px-3 py-2 rounded whitespace-pre-wrap">
                    {value ?? '-'}
                  </p>
                )}
              </div>
            );
          }

          return (
            <div key={key} className="flex flex-col">
              <label className="text-[#1F2163] font-medium capitalize mb-1">
                {key.replace(/_/g, ' ')}:
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={value ?? ''}
                  onChange={(e) => setEditedAgreement({ ...editedAgreement, [key]: e.target.value })}
                  className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D9AC42]"
                />
              ) : (
                <p className="text-gray-800 bg-gray-100 px-3 py-2 rounded">{value ?? '-'}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-4 mt-6">
        {editMode ? (
          <button onClick={handleSaveEdit} className="bg-[#D9AC42] text-white py-2 px-6 rounded hover:bg-[#c3932d]">
            Save
          </button>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="bg-[#1F2163] text-white py-2 px-6 rounded hover:bg-[#0f1856]">
            Edit
          </button>
        )}
        <button
          onClick={() => setSelectedAgreement(null)}
          className="bg-gray-300 text-gray-700 py-2 px-6 rounded hover:bg-gray-400">
          Close
        </button>
      </div>
    </div>
  </div>
)}


    </Sidebar>
  );
}
