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
  const [sortAsc, setSortAsc] = useState(true);
  const [showActiveOnly, setShowActiveOnly] = useState(false);


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
        // Sort agreements by end date
          const distantFuture = new Date('2999-12-31').getTime();
          const sortedAgreements = [...data].sort((a, b) => {
          const aEnd = a.end_date ? new Date(a.end_date).getTime() : distantFuture;
          const bEnd = b.end_date ? new Date(b.end_date).getTime() : distantFuture;
          return aEnd - bEnd;
        });
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
    setSelectedAgreement(null); // CLOSES THE MODAL
    setEditMode(false);
  } else {
    console.error("Update failed:", error.message);
  }
};


  const filteredAgreements = [...agreements]
  .filter(item => {
    const matchesQuery = item.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.agreement_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || item.agreement_type === filterType;
    const isActive = new Date(item.end_date) >= new Date();
    return matchesQuery && matchesType && (!showActiveOnly || isActive);
  })
  .sort((a, b) => {
    const future = new Date('2100-12-31').getTime();
    const aTime = a.end_date ? new Date(a.end_date).getTime() : future;
    const bTime = b.end_date ? new Date(b.end_date).getTime() : future;
    return sortAsc ? aTime - bTime : bTime - aTime;
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
          <div className="flex items-center gap-4 mb-4">
  <button
    onClick={() => setSortAsc(!sortAsc)}
    className="px-3 py-1 border rounded text-sm bg-gray-100 hover:bg-gray-200"
  >
    Sort: {sortAsc ? 'Soonest → Latest' : 'Latest → Soonest'}
  </button>
  <label className="flex items-center gap-2 text-sm">
    <input
      type="checkbox"
      checked={showActiveOnly}
      onChange={e => setShowActiveOnly(e.target.checked)}
    />
    Show Active Only
  </label>
</div>

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
        <div className="fixed inset-0 bg-gradient-to-b from-[#692B2C] to-[#1F2163] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-[#1F2163]">Edit Agreement</h2>
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
      
  const value = editedAgreement[key];
  if (key === 'id') return null;

  const isAcademicField = ['jd_dd', 'joint_lab', 'staff_mobility', 'student_mobility', 'joint_supervision', 'co_teaching'].includes(key);
  const isResearchField = ['joint_research', 'joint_publication'].includes(key);

  if ((isAcademicField && !editedAgreement.academic_collab) || (isResearchField && !editedAgreement.research_collab)) {
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
    setEditedAgreement((prev) => ({
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
      setEditedAgreement((prev) => ({
        ...prev,
        [key]: updated
      }));
    };

    const handleAdd = () => {
      const newEntry = fields.reduce((obj, f) => ({ ...obj, [f]: '' }), {});
      setEditedAgreement((prev) => ({
        ...prev,
        [key]: [...arr, newEntry]
      }));
    };

    const handleRemove = (index) => {
      const updated = arr.filter((_, i) => i !== index);
      setEditedAgreement((prev) => ({
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
            onClick={() => setEditedAgreement((prev) => ({ ...prev, [key]: true }))}
            className={`px-4 py-2 rounded ${value === true ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setEditedAgreement((prev) => ({ ...prev, [key]: false }))}
            className={`px-4 py-2 rounded ${value === false ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            No
          </button>
        </div>
      </div>
    );
  }

  const handleModalChange = (e) => {
  const { name, value } = e.target;
  setEditedAgreement((prev) => ({
    ...prev,
    [name]: value,
  }));
};

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
                onClick={() => setSelectedAgreement(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-[#1F2163] text-white rounded-lg hover:bg-[#0F1153] disabled:opacity-70"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}