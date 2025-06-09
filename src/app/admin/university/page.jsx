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

  let displayValue;

  // Generic handler for JSON arrays
  const renderJsonList = (arr, fields) => (
  <ul className="list-disc ml-4">
    {arr.map((entry, index) => {
      const content = fields
        .map((field) => entry[field])
        .filter((val) => val && val.trim?.() !== '')
        .join(', ');
      if (!content) return null;
      return <li key={index}>{content}</li>;
    })}
  </ul>
);

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
            <li key={idx}>
              <strong>{item.field}:</strong> {item.value}
            </li>
          );
        })}
      </ul>
    );
  } else {
    return null;
  }
  }   else if (label === 'Joint Publication') {
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
  }  else if (label === 'Contacts') {
    if (Array.isArray(value)) {
    const fields = ['name', 'email'];
    displayValue = renderJsonList(value, fields);
  } else {
    displayValue = <span className="italic text-gray-500">No data</span>;
  }
} else if (typeof value === 'boolean') {
  displayValue = value ? 'Yes' : 'No';
} else { displayValue = value; }

  if (!displayValue) return null;
  return (
    <li key={label} className="text-sm text-gray-700 ml-4">
      <strong>{label}:</strong> {displayValue}
    </li>
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
          {/* Header with Gradient Background */}
          <div className="bg-gradient-to-r from-[#1F2163] to-[#161A42] p-6 rounded-xl shadow-lg mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">University Agreements</h1>
                <p className="text-blue-100 mt-1">Manage all university partnership agreements</p>
              </div>
              <div className="relative w-1/2">
                <input
                  type="text"
                  placeholder="🔍 Search universities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-[#D9AC42] bg-white bg-opacity-90 text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Undo Notification */}
          {lastDeleted && (
            <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg shadow-sm flex justify-between items-center">
              <span>Agreement deleted. You can undo this action.</span>
              <button
                onClick={handleUndo}
                className="ml-4 px-4 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
              >
                Undo
              </button>
            </div>
          )}

          {/* Universities List */}
          {filteredUniversities.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow text-center">
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No universities match your search' : 'No universities found'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredUniversities.map(([university, agreementTypes]) => (
                <div key={university} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-[#1F2163]">{university}</h2>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {Object.entries(agreementTypes).map(([type, agreements]) => {
                      const key = `${university}-${type}`;
                      const isOpen = openDropdowns[key];
                      return (
                        <div key={type} className="p-4">
                          <button
                            onClick={() => toggleDropdown(university, type)}
                            className="w-full flex justify-between items-center text-left"
                          >
                            <h3 className="text-lg font-medium text-gray-800">{type}</h3>
                            <span className="text-gray-500">
                              {isOpen ? '▲' : '▼'}
                            </span>
                          </button>
                          
                          {isOpen && (
                            <div className="mt-4 space-y-4">
                              {agreements.map((agreement) => (
                                <div key={agreement.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                  <ul className="space-y-2">
                                    {renderAttribute('Contacts', agreement.contacts)}
                                    {renderAttribute('JUC Member', agreement.juc_member)}
                                    {renderAttribute('Academic Collaboration', agreement.academic_collab)}
                                    {renderAttribute('Research Collaboration', agreement.research_collab)}
                                    {renderAttribute('Start Date', agreement.start_date)}
                                    {renderAttribute('End Date', agreement.end_date)}
                                    {renderAttribute('i-Kohza', agreement.i_kohza)}
                                    {renderAttribute('PIC MJIIT', agreement.pic_mjiit)}
                                    {renderAttribute('Join Degree / Double Degree', agreement.jd_dd)}
                                    {renderAttribute('Joint Lab', agreement.joint_lab)}
                                    {renderAttribute('Co-Teaching', agreement.co_teaching)}
                                    {renderAttribute('Staff Mobility', agreement.staff_mobility)}
                                    {renderAttribute('Student Mobility', agreement.student_mobility)}
                                    {renderAttribute('Joint Supervision', agreement.joint_supervision)}
                                    {renderAttribute('Joint Publication', agreement.joint_publication)}
                                    {renderAttribute('Others', agreement.others)}
                                  </ul>
                                  
                                  <div className="flex justify-end gap-2 mt-4">
                                    <button
                                      onClick={() => handleEditClick(agreement)}
                                      className="px-4 py-2 bg-[#1F2163] text-white rounded-lg hover:bg-[#0F1153] text-sm"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(agreement.id)}
                                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {modalOpen && editAgreement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-[#1F2163]">Edit Agreement</h2>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Keep all your existing modal content exactly as is */}
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

  const years = Array.from({ length: 401 }, (_, i) => new Date().getFullYear() - 200 + i);
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
      <label className="text-sm text-gray-700 block mb-1">{key === 'start_date' ? 'Start Date' : 'End Date'}</label>
      <div className="flex gap-2">
        <select
          value={year}
          onChange={(e) => updateDate(+e.target.value, month, day)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={month}
          onChange={(e) => updateDate(year, +e.target.value, day)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          {months.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={day}
          onChange={(e) => updateDate(year, month, +e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          {days.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
    </div>
  );
}


  // Helper to render dynamic JSON fields
  const renderJsonArrayEditor = (key, label, fields) => {
    let arr = [];
    try {
      arr = Array.isArray(value) ? value : JSON.parse(value) || [];
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
        <label className="text-sm text-gray-700 block mb-1">{label}</label>
        {arr.map((item, index) => (
          <div key={index} className="flex gap-2 items-center mb-2">
            {fields.map((field, i) => (
              <input
                key={i}
                type="text"
                placeholder={field.replace(/_/g, ' ')}
                value={item[field] || ''}
                onChange={(e) => handleChange(index, field, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            ))}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAdd}
          className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          Add {label}
        </button>
      </div>
    );
  };

  // === Render JSONB fields ===
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


  // === Handle yes/no toggles ===
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

  if (key === 'jd_dd') 
    { 
      const labelMap = { jd_dd: "Join Degree / Double Degree" };
      return (
      <div key={key} className="col-span-full">
        <label className="text-sm text-gray-700 block mb-1">{labelMap[key]}</label>
        <div className="flex gap-2">

      <textarea
        name={key}
        value={value ?? ''}
        onChange={handleModalChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md resize-y min-h-[80px]"
      />
      </div>
      </div>
          )
    }

  // === Default text area fallback ===
  return (
    <div key={key} className="col-span-full">
      <label className="text-sm text-gray-700 block mb-1">{key}</label>
      <textarea
        name={key}
        value={value ?? ''}
        onChange={handleModalChange}
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
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-[#1F2163] text-white rounded-lg hover:bg-[#0F1153] disabled:opacity-70"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
