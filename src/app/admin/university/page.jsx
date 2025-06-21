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

  const renderJsonList = (arr, fields) => (
    <ul className="list-disc ml-5 space-y-1">
      {arr.map((entry, index) => {
        const content = fields
          .map((field) => entry[field])
          .filter((val) => val && val.trim?.() !== '')
          .join(', ');
        if (!content) return null;
        return <li key={index} className="text-sm text-gray-700">{content}</li>;
      })}
    </ul>
  );

  const renderAttribute = (label, value) => {
    if (value === null || value === undefined || value === '') return null;

    let displayValue;

    if (['Co-Teaching', 'Staff Mobility', 'Joint Supervision', 'Joint Research'].includes(label)) {
      if (Array.isArray(value) && value.some(entry => Object.values(entry).some(v => v?.trim?.() !== ''))) {
        const fields = ['name', 'year'];
        displayValue = renderJsonList(value, fields);
      } else {
        return null;
      }
    } else if (label === 'Student Mobility') {
      if (Array.isArray(value) && value.some(entry => Object.values(entry).some(v => v?.trim?.() !== ''))) {
        const fields = ['name', 'year', 'number_of_students'];
        displayValue = renderJsonList(value, fields);
      } else {
        return null;
      }
    } else if (label === 'Others') {
      if (Array.isArray(value) && value.some(item => item.field?.trim() || item.value?.trim())) {
        displayValue = (
          <ul className="list-disc list-inside space-y-1">
            {value.map((item, idx) => {
              if (!item.field?.trim() && !item.value?.trim()) return null;
              return (
                <li key={idx} className="text-sm text-gray-700">
                  <span className="font-medium">{item.field}:</span> {item.value}
                </li>
              );
            })}
          </ul>
        );
      } else {
        return null;
      }
    } else if (label === 'Joint Publication') {
      if (
        !Array.isArray(value) ||
        value.length === 0 ||
        value.every(entry =>
          !entry.year?.trim() && !entry.author?.trim() && !entry.publisher?.trim()
        )
      ) {
        return null;
      }
      const fields = ['publisher', 'author', 'year'];
      displayValue = renderJsonList(value, fields);
    } else if (label === 'Contacts') {
      if (Array.isArray(value)) {
        const fields = ['name', 'email'];
        displayValue = renderJsonList(value, fields);
      } else {
        displayValue = <span className="italic text-gray-500 text-sm">No data</span>;
      }
    } else if (typeof value === 'boolean') {
      displayValue = (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Yes' : 'No'}
        </span>
      );
    } else { 
      displayValue = <span className="text-gray-700">{value}</span>; 
    }

    if (!displayValue) return null;
    return displayValue;
  };

  const renderJsonArrayEditor = (key, label, fields) => {
    let arr = [];
    try {
      arr = Array.isArray(editAgreement[key]) ? editAgreement[key] : JSON.parse(editAgreement[key] || '[]');
    } catch {
      arr = [];
    }

    const handleChange = (index, field, fieldValue) => {
      const updated = [...arr];
      updated[index] = { ...updated[index], [field]: fieldValue };
      setEditAgreement((prev) => ({
        ...prev,
        [key]: updated
      }));
    };

    const handleAdd = () => {
      const newEntry = fields.reduce((obj, f) => ({ ...obj, [f]: '' }), {});
      setEditAgreement((prev) => ({
        ...prev,
        [key]: [...arr, newEntry]
      }));
    };

    const handleRemove = (index) => {
      const updated = arr.filter((_, i) => i !== index);
      setEditAgreement((prev) => ({
        ...prev,
        [key]: updated
      }));
    };

    return (
      <div key={key} className="col-span-full">
        <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
        {arr.map((item, index) => (
          <div key={index} className="flex gap-2 items-center mb-2">
            {fields.map((field, i) => (
              <input
                key={i}
                type="text"
                placeholder={field.replace(/_/g, ' ')}
                value={item[field] || ''}
                onChange={(e) => handleChange(index, field, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1F2163] focus:border-[#1F2163]"
              />
            ))}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="text-red-500 hover:text-red-700 p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAdd}
          className="mt-2 px-3 py-1 bg-[#1F2163] text-white text-sm rounded hover:bg-[#0F1153]"
        >
          Add {label}
        </button>
      </div>
    );
  };

  const filteredUniversities = Object.entries(groupedData).filter(
    ([university]) => university.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!userEmail || loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1F2163]"></div>
    </div>
  );

  return (
    <Sidebar role="admin" email={userEmail}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-[#1F2163] to-[#161A42] p-8 rounded-2xl shadow-lg mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-20">
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 0C44.8 0 0 44.8 0 100C0 155.2 44.8 200 100 200C155.2 200 200 155.2 200 100C200 44.8 155.2 0 100 0Z" fill="#D9AC42"/>
              </svg>
            </div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">University Agreements</h1>
                <p className="text-blue-100 mt-2">Manage all university partnership agreements</p>
              </div>
              <div className="relative w-full md:w-1/2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search universities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-[#D9AC42] bg-white/90 text-gray-800 placeholder-gray-500 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Undo Notification */}
          {lastDeleted && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow-sm flex justify-between items-center animate-fade-in">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span className="text-yellow-800">Agreement deleted. You can undo this action.</span>
              </div>
              <button
                onClick={handleUndo}
                className="ml-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium transition-colors"
              >
                Undo
              </button>
            </div>
          )}

          {/* Universities List */}
          {filteredUniversities.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-gray-500 text-lg mt-4">
                {searchTerm ? 'No universities match your search' : 'No universities found'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredUniversities.map(([university, agreementTypes]) => (
                <div key={university} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                  <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-[#1F2163] flex items-center">
                      <svg className="w-5 h-5 mr-2 text-[#D9AC42]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      {university}
                    </h2>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {Object.entries(agreementTypes).map(([type, agreements]) => {
                      const key = `${university}-${type}`;
                      const isOpen = openDropdowns[key];
                      return (
                        <div key={type} className="p-5 hover:bg-gray-50 transition-colors">
                          <button
                            onClick={() => toggleDropdown(university, type)}
                            className="w-full flex justify-between items-center text-left group"
                          >
                            <div className="flex items-center">
                              <span className={`w-5 h-5 mr-3 transform transition-transform ${isOpen ? 'rotate-90 text-[#1F2163]' : 'text-gray-500'}`}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                              </span>
                              <h3 className="text-lg font-medium text-gray-800 group-hover:text-[#1F2163]">{type}</h3>
                            </div>
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              {agreements.length} {agreements.length === 1 ? 'agreement' : 'agreements'}
                            </span>
                          </button>
                          
                          {isOpen && (
                            <div className="mt-4 space-y-4 animate-fade-in">
                              {agreements.map((agreement) => (
                                <div key={agreement.id} className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <tbody className="divide-y divide-gray-200">
                                        {[
                                          { label: 'Contacts', value: agreement.contacts },
                                          { label: 'JUC Member', value: agreement.juc_member },
                                          { label: 'Academic Collaboration', value: agreement.academic_collab },
                                          { label: 'Research Collaboration', value: agreement.research_collab },
                                          { label: 'Start Date', value: agreement.start_date },
                                          { label: 'End Date', value: agreement.end_date },
                                          { label: 'i-Kohza', value: agreement.i_kohza },
                                          { label: 'PIC MJIIT', value: agreement.pic_mjiit },
                                          { label: 'Join Degree / Double Degree', value: agreement.jd_dd },
                                          { label: 'Joint Lab', value: agreement.joint_lab },
                                          { label: 'Co-Teaching', value: agreement.co_teaching },
                                          { label: 'Staff Mobility', value: agreement.staff_mobility },
                                          { label: 'Student Mobility', value: agreement.student_mobility },
                                          { label: 'Joint Supervision', value: agreement.joint_supervision },
                                          { label: 'Joint Publication', value: agreement.joint_publication },
                                          { label: 'Others', value: agreement.others }
                                        ].map(({ label, value }) => {
                                          const displayValue = renderAttribute(label, value);
                                          if (!displayValue) return null;
                                          
                                          return (
                                            <tr key={label} className="hover:bg-gray-50">
                                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 w-1/4">
                                                <div className="flex items-center">
                                                  <span className="w-2 h-2 rounded-full bg-[#D9AC42] mr-2"></span>
                                                  {label}
                                                </div>
                                              </td>
                                              <td className="px-4 py-3 text-sm text-gray-700 w-3/4">
                                                {displayValue}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                  
                                  <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
                                    <button
                                      onClick={() => handleEditClick(agreement)}
                                      className="px-4 py-2 bg-[#1F2163] text-white rounded-lg hover:bg-[#0F1153] text-sm font-medium flex items-center transition-colors"
                                    >
                                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                      </svg>
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(agreement.id)}
                                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center transition-colors"
                                    >
                                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                      </svg>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {modalOpen && editAgreement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-[#1F2163]">Edit Agreement</h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
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
                const value = editAgreement[key];
                if (key === 'id') return null;

                const isAcademicField = ['jd_dd', 'joint_lab', 'staff_mobility', 'student_mobility', 'joint_supervision', 'co_teaching'].includes(key);
                const isResearchField = ['joint_research', 'joint_publication'].includes(key);

                if ((isAcademicField && !editAgreement.academic_collab) || (isResearchField && !editAgreement.research_collab)) {
                  return null;
                }

                if (key === 'start_date' || key === 'end_date') {
                  const date = value ? new Date(value) : new Date();
                  const year = date.getFullYear();
                  const month = date.getMonth() + 1;
                  const day = date.getDate();

                  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);
                  const months = Array.from({ length: 12 }, (_, i) => i + 1);
                  const days = Array.from({ length: 31 }, (_, i) => i + 1);

                  const updateDate = (newYear, newMonth, newDay) => {
                    const newDate = new Date(newYear, newMonth - 1, newDay);
                    setEditAgreement((prev) => ({
                      ...prev,
                      [key]: newDate.toISOString().split('T')[0],
                    }));
                  };

                  return (
                    <div key={key} className="col-span-full">
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        {key === 'start_date' ? 'Start Date' : 'End Date'}
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={year}
                          onChange={(e) => updateDate(Number(e.target.value), month, day)}
                          className="border border-gray-300 rounded px-2 py-1 focus:ring-[#1F2163] focus:border-[#1F2163]"
                        >
                          {years.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <select
                          value={month}
                          onChange={(e) => updateDate(year, Number(e.target.value), day)}
                          className="border border-gray-300 rounded px-2 py-1 focus:ring-[#1F2163] focus:border-[#1F2163]"
                        >
                          {months.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select
                          value={day}
                          onChange={(e) => updateDate(year, month, Number(e.target.value))}
                          className="border border-gray-300 rounded px-2 py-1 focus:ring-[#1F2163] focus:border-[#1F2163]"
                        >
                          {days.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                  );
                }

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

                if (key === 'juc_member' || key === 'academic_collab' || key === 'research_collab') {
                  const labelMap = {
                    juc_member: 'JUC Member',
                    academic_collab: 'Academic Collaboration',
                    research_collab: 'Research Collaboration'
                  };

                  return (
                    <div key={key} className="col-span-full">
                      <label className="text-sm font-medium text-gray-700 block mb-1">{labelMap[key]}</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditAgreement((prev) => ({ ...prev, [key]: true }))}
                          className={`px-4 py-2 rounded ${value === true ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditAgreement((prev) => ({ ...prev, [key]: false }))}
                          className={`px-4 py-2 rounded ${value === false ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  );
                }

                if (key === 'jd_dd') {
                  return (
                    <div key={key} className="col-span-full">
                      <label className="text-sm font-medium text-gray-700 block mb-1">Join Degree / Double Degree</label>
                      <textarea
                        name={key}
                        value={value ?? ''}
                        onChange={handleModalChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1F2163] focus:border-[#1F2163] resize-y min-h-[80px]"
                      />
                    </div>
                  );
                }

                return (
                  <div key={key}>
                    <label className="text-sm font-medium text-gray-700 block mb-1">{key.replace(/_/g, ' ')}</label>
                    <input
                      type="text"
                      name={key}
                      value={value ?? ''}
                      onChange={handleModalChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1F2163] focus:border-[#1F2163]"
                    />
                  </div>
                );
              })}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-[#1F2163] text-white rounded-lg hover:bg-[#0F1153] disabled:opacity-70 font-medium transition-colors flex items-center"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}