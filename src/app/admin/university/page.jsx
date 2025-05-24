// Added undo feature using a temporary state to store the last deleted agreement

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';

export default function UniversityPage() {
  const [userEmail, setUserEmail] = useState(null);
  const [groupedData, setGroupedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [editAgreement, setEditAgreement] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastDeleted, setLastDeleted] = useState(null);
  const [undoTimer, setUndoTimer] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) setUserEmail(data.user.email);
    };
    fetchUser();
  }, []);

  const fetchAgreements = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('agreements_2').select('*');
    if (error) {
      console.error('Error fetching agreements:', error);
      return;
    }
    const grouped = {};
    data.forEach((agreement) => {
      const { university, agreement_type } = agreement;
      if (!grouped[university]) grouped[university] = {};
      if (!grouped[university][agreement_type]) grouped[university][agreement_type] = [];
      grouped[university][agreement_type].push(agreement);
    });
    
    // Sort universities alphabetically
    const sortedGrouped = {};
    Object.keys(grouped).sort().forEach(key => {
      sortedGrouped[key] = grouped[key];
    });
    
    setGroupedData(sortedGrouped);
    setLoading(false);
  };

  useEffect(() => {
    if (userEmail) fetchAgreements();
  }, [userEmail]);

  const toggleDropdown = (university, type) => {
    const key = `${university}-${type}`;
    setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEditClick = (agreement) => {
    setEditAgreement({ ...agreement });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this agreement?')) return;
    const { data, error } = await supabase.from('agreements_2').select('*').eq('id', id).single();
    if (error) return console.error('Fetch deleted item error:', error);
    setLastDeleted(data);

    const deleteResult = await supabase.from('agreements_2').delete().eq('id', id);
    if (deleteResult.error) console.error('Delete error:', deleteResult.error);
    else fetchAgreements();

    if (undoTimer) clearTimeout(undoTimer);
    const timer = setTimeout(() => setLastDeleted(null), 10000);
    setUndoTimer(timer);
  };

  const handleUndo = async () => {
    if (!lastDeleted) return;
    const { error } = await supabase.from('agreements_2').insert([lastDeleted]);
    if (error) return console.error('Undo insert error:', error);
    setLastDeleted(null);
    clearTimeout(undoTimer);
    fetchAgreements();
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setEditAgreement((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { id, ...rest } = editAgreement;
    const { error } = await supabase.from('agreements_2').update(rest).eq('id', id);
    if (error) console.error('Update error:', error);
    else {
      setModalOpen(false);
      fetchAgreements();
    }
    setSaving(false);
  };

  const renderAttribute = (label, value) => {
    if (value === null || value === undefined || value === '') return null;
    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
    return (
      <li key={label} className="text-sm text-gray-700 ml-4">
        <strong>{label}:</strong> {displayValue}
      </li>
    );
  };

  const filteredUniversities = Object.entries(groupedData).filter(
    ([university]) => university.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!userEmail || loading) return <div className="p-6">Loading...</div>;

   return (
    <Sidebar role="admin" email={userEmail}>
      <div className="text-black p-6 bg-white rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#1F2163]">University Agreements</h1>
        </div>

        {lastDeleted && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded flex justify-between items-center">
            <span>Agreement deleted.</span>
            <button
              onClick={handleUndo}
              className="ml-4 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Undo
            </button>
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search university..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {filteredUniversities.length === 0 && (
          <div className="text-gray-600">No universities match your search.</div>
        )}

        {filteredUniversities.map(([university, agreementTypes]) => (
          <div key={university} className="mb-10 border-b pb-6">
            <h2 className="text-2xl font-semibold text-[#1F2163] mb-3">{university}</h2>
            {Object.entries(agreementTypes).map(([type, agreements]) => {
              const key = `${university}-${type}`;
              const isOpen = openDropdowns[key];
              return (
                <div key={type} className="mb-4">
                  <button
                    onClick={() => toggleDropdown(university, type)}
                    className="text-left w-full flex justify-between items-center bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded shadow"
                  >
                    <h3 className="text-lg font-medium text-gray-900">{type}</h3>
                    <span>{isOpen ? '▲' : '▼'}</span>
                  </button>
                  {isOpen && (
                    <div className="mt-2">
                      {agreements.map((agreement) => (
                        <div key={agreement.id} className="mb-4 border border-gray-200 rounded p-4 shadow-sm bg-white">
                          <ul className="list-disc ml-6">
                            {renderAttribute('JUC Member', agreement.juc_member)}
                            {renderAttribute('Academic Collaboration', agreement.academic_collab)}
                            {renderAttribute('Research Collaboration', agreement.research_collab)}
                            {renderAttribute('Start Date', agreement.start_date)}
                            {renderAttribute('End Date', agreement.end_date)}
                            {renderAttribute('i-Kohza', agreement.i_kohza)}
                            {renderAttribute('PIC MJIIT', agreement.pic_mjiit)}
                            {renderAttribute('JD/DD', agreement.jd_dd)}
                            {renderAttribute('Joint Lab', agreement.joint_lab)}
                            {renderAttribute('Co-Teaching', agreement.co_teaching)}
                            {renderAttribute('Staff Mobility', agreement.staff_mobility)}
                            {renderAttribute('Student Mobility', agreement.student_mobility)}
                            {renderAttribute('Joint Supervision', agreement.joint_supervision)}
                            {renderAttribute('Joint Publication', agreement.joint_publication)}
                          </ul>
                          <div className="flex justify-end mt-4 space-x-2">
                            <button
                              onClick={() => handleEditClick(agreement)}
                              className="px-4 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(agreement.id)}
                              className="px-4 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {modalOpen && editAgreement && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-2xl w-full">
            <h2 className="text-xl font-semibold mb-4">Edit Agreement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              {Object.entries(editAgreement).map(([key, value]) => {
                if (key === 'id') return null;
                return (
                  <div key={key}>
                    <label className="text-sm text-gray-700">{key}</label>
                    <input
                      type="text"
                      name={key}
                      value={value ?? ''}
                      onChange={handleModalChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
