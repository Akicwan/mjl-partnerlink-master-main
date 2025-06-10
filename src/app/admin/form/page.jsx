"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../../components/Sidebar';
import { supabase } from '../../lib/supabaseClient';

export default function AgreementForm() {
  const [userEmail, setUserEmail] = useState(null);
  const router = useRouter();

  const [contacts, setContacts] = useState([{ name: '', email: '' }]);
  const [others, setOthers] = useState([{ field: '', value: '' }]);
  const [coTeachings, setCoTeachings] = useState([{ name: '', year: '' }]);
  const [staffMobilities, setStaffMobilities] = useState([{ name: '', year: '' }]);
  const [studentMobilities, setStudentMobilities] = useState([{ name: '', year: '', number_of_students: '' }]);
  const [jointSupervisions, setJointSupervisions] = useState([{ name: '', year: '' }]);
  const [jointResearches, setJointResearches] = useState([{ name: '', year: '' }]);
  const [jointPublications, setJointPublications] = useState([{ publisher: '', author: '', year: '' }]);

  const [form, setForm] = useState({
    university: '', abbreviation: '', juc_member: null,
    agreement_type: '', academic_collab: false, research_collab: false,
    start_date: '', end_date: '', i_kohza: '', pic_mjiit: '',
    jd_dd: '', joint_lab: '', staff_mobility: '', student_mobility: '', joint_supervision: '',
    joint_research: '', joint_publication: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        console.error("User fetch error:", error);
        router.push('/login');
      } else {
        setUserEmail(data.user.email);
      }
    };

    fetchUser();
  }, [router]);

  const agreementOptions = [
    'MOA', 'MOA Regional Conference Program  Agreement', 'MOU', 'Cross Appointment',
    'Academic Cooperation', 'Outsourcing Agreement', 'Satellite Office', 'Exchange Agreement',
    'Agreement', 'Academic Agreement', 'Collaborative Research Agreement Biological Soil Crust (BSC)',
    'LOA & Outsourcing Agreement (two agreement types)', 'CRA', 'SEA', 'LOA', 'LOC', 'LOI', 'JRA'
  ];

  // Updated styling classes
const inputClasses = "w-full bg-white text-gray-800 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F2163] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md";
const textareaClasses = `${inputClasses} resize-y min-h-[40px]`;
const buttonClasses = "px-5 py-2.5 bg-gradient-to-r from-[#1F2163] to-[#161A42] text-white font-medium rounded-lg hover:from-[#161A42] hover:to-[#1F2163] transition-all duration-200 shadow-md hover:shadow-lg active:scale-95";
const deleteButtonClasses = "w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-200 shadow hover:shadow-md active:scale-90";
const sectionClasses = "bg-white p-6 rounded-xl shadow-md";
const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
const checkboxClasses = "w-4 h-4 text-[#1F2163] border-gray-300 rounded focus:ring-[#1F2163]";

  const handleFormChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const toggleCheckbox = field => setForm(prev => ({ ...prev, [field]: !prev[field] }));

  const addContact = () => setContacts(prev => [...prev, { name: '', email: '' }]);
  const updateContact = (i, f, v) => setContacts(prev => prev.map((c, idx) => idx === i ? { ...c, [f]: v } : c));
  const removeContact = i => setContacts(prev => prev.filter((_, idx) => idx !== i));

  const addOther = () => setOthers(prev => [...prev, { field: '', value: '' }]);
  const updateOther = (i, f, v) => setOthers(prev => prev.map((o, idx) => idx === i ? { ...o, [f]: v } : o));
  const removeOther = i => setOthers(prev => prev.filter((_, idx) => idx !== i));

  const addCoTeaching = () => setCoTeachings(prev => [...prev, { name: '', year: '' }]);
  const updateCoTeaching = (i, f, v) => setCoTeachings(prev => prev.map((c, idx) => idx === i ? { ...c, [f]: v } : c));
  const removeCoTeaching = i => setCoTeachings(prev => prev.filter((_, idx) => idx !== i));

  const clearAllFields = () => {
  setForm({
    university: '', abbreviation: '', juc_member: null,
    agreement_type: '', academic_collab: false, research_collab: false,
    start_date: '', end_date: '', i_kohza: '', pic_mjiit: '',
    jd_dd: '', joint_lab: '', staff_mobility: '', student_mobility: '', joint_supervision: '',
    joint_research: '', joint_publication: ''
  });

  setContacts([{ name: '', email: '' }]);
  setOthers([{ field: '', value: '' }]);
  setCoTeachings([{ name: '', year: '' }]);
  setStaffMobilities([{ name: '', year: '' }]);
  setStudentMobilities([{ name: '', year: '', number_of_students: '' }]);
  setJointSupervisions([{ name: '', year: '' }]);
  setJointResearches([{ name: '', year: '' }]);
  setJointPublications([{ publisher: '', author: '', year: '' }]);
};



  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      ...form,
      contacts,
      others,
      co_teaching: coTeachings,
      staff_mobility: staffMobilities,
      student_mobility: studentMobilities,
      joint_supervision: jointSupervisions,
      joint_research: jointResearches,
      joint_publication: jointPublications
    };

    const { data, error } = await supabase.from('agreements_2').insert([payload]).select();

    if (error) {
      console.error(error);
      setMessage('Failed to save agreement.');
    } else {
      setMessage('Agreement saved successfully!');
      setForm(prev => ({ ...prev, agreement_type: '' }));
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <Sidebar role="admin" email={userEmail}>
      <div className="p-6 bg-gray-50 min-h-screen">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-[#1F2163] to-[#161A42] p-6 rounded-xl shadow-lg">
  <h2 className="text-2xl font-bold text-white">Agreement Form</h2>
  <p className="text-blue-100 mt-1">Fill in the details of the university agreement</p>
</div>

          <div className={sectionClasses}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['university','abbreviation'].map(field=>(
                <div key={field}>
                  <label className={labelClasses}>
                    {field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea 
                    required 
                    rows={2} 
                    value={form[field]} 
                    onChange={e=>handleFormChange(field,e.target.value)} 
                    className={textareaClasses} 
                  />
                </div>
              ))}
              
              <div>
                <label className={labelClasses}>
                  Agreement Type<span className="text-red-500 ml-1">*</span>
                </label>
                <input 
                  list="agreementTypes" 
                  value={form.agreement_type} 
                  onChange={e=>handleFormChange('agreement_type', e.target.value)} 
                  className={inputClasses} 
                  required 
                />
                <datalist id="agreementTypes">
                  {agreementOptions.map(opt => (
                    <option key={opt} value={opt} />
                  ))}
                </datalist>
              </div>
              
              <div>
                <label className={labelClasses}>
                  JUC Member<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex gap-6 mt-2">
                  <label className="inline-flex items-center gap-2 text-gray-700">
                    <input 
                      type="radio" 
                      required 
                      onChange={() => handleFormChange('juc_member', true)} 
                      checked={form.juc_member === true} 
                      className="text-yellow-600 focus:ring-yellow-500" 
                    /> 
                    Yes
                  </label>
                  <label className="inline-flex items-center gap-2 text-gray-700">
                    <input 
                      type="radio" 
                      required 
                      onChange={() => handleFormChange('juc_member', false)} 
                      checked={form.juc_member === false} 
                      className="text-yellow-600 focus:ring-yellow-500" 
                    /> 
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Contacts Section */}
          <div className={sectionClasses}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Contact Persons</h3>
            
            <AnimatePresence>
              {contacts.map((c,i)=>(
                <motion.div 
                  key={i} 
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4"
                  initial={{opacity:0,y:-10}} 
                  animate={{opacity:1,y:0}} 
                  exit={{opacity:0,y:10}} 
                  transition={{duration:0.2}}
                >
                  <div>
                    <label className={labelClasses}>Name<span className="text-red-500 ml-1">*</span></label>
                    <input
                      placeholder="Name" 
                      required 
                      value={c.name} 
                      onChange={e=>updateContact(i,'name',e.target.value)} 
                      className={inputClasses} 
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Email<span className="text-red-500 ml-1">*</span></label>
                    <input
                      placeholder="Email" 
                      required 
                      value={c.email} 
                      onChange={e=>updateContact(i,'email',e.target.value)} 
                      className={inputClasses} 
                    />
                  </div>
                  <div className="flex justify-end">
                    {contacts.length>1 && (
                      <button 
                        type="button" 
                        onClick={()=>removeContact(i)} 
                        className={deleteButtonClasses}
                        aria-label="Remove contact"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <button 
              type="button" 
              onClick={addContact} 
              className={`${buttonClasses} bg-gray-700 hover:bg-gray-800`}
            >
              + Add Contact
            </button>
          </div>

          {/* Collaboration Section */}
          <div className={sectionClasses}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Collaboration Type</h3>
            
            <div className="flex gap-8 mb-6">
              <label className="inline-flex items-center gap-3 text-gray-700">
                <input 
                  type="checkbox" 
                  checked={form.academic_collab} 
                  onChange={()=>toggleCheckbox('academic_collab')} 
                  className={checkboxClasses}
                /> 
                <span className="font-medium">Academic Collaboration</span>
              </label>
              <label className="inline-flex items-center gap-3 text-gray-700">
                <input 
                  type="checkbox" 
                  checked={form.research_collab} 
                  onChange={()=>toggleCheckbox('research_collab')} 
                  className={checkboxClasses}
                /> 
                <span className="font-medium">Research Collaboration</span>
              </label>
            </div>

            {/* Academic Collaboration Fields */}
            {form.academic_collab && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {['jd_dd','joint_lab'].map(f => {
                    const labelMap = {
                      jd_dd: 'Join Degree / Double Degree',
                      joint_lab: 'Joint Lab'
                    };
                    return (
                      <div key={f}>
                        <label className={labelClasses}>{labelMap[f]}</label>
                        <textarea 
                          rows={2} 
                          value={form[f]} 
                          onChange={e => handleFormChange(f, e.target.value)} 
                          className={textareaClasses} 
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Co-Teaching */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Co-Teaching</h4>
                  <AnimatePresence>
                    {coTeachings.map((c, i) => (
                      <motion.div 
                        key={i} 
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4"
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 10 }} 
                        transition={{ duration: 0.2 }}
                      >
                        <div>
                          <label className={labelClasses}>Name</label>
                          <input
                            placeholder="Name" 
                            value={c.name} 
                            onChange={e => updateCoTeaching(i, 'name', e.target.value)} 
                            className={inputClasses} 
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>Year</label>
                          <input
                            placeholder="Year" 
                            value={c.year} 
                            onChange={e => updateCoTeaching(i, 'year', e.target.value)} 
                            className={inputClasses} 
                          />
                        </div>
                        <div className="flex justify-end">
                          {coTeachings.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => removeCoTeaching(i)} 
                              className={deleteButtonClasses}
                              aria-label="Remove co-teaching"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <button 
                    type="button" 
                    onClick={addCoTeaching} 
                    className={`${buttonClasses} bg-gray-700 hover:bg-gray-800`}
                  >
                    + Add Co-Teaching
                  </button>
                </div>

                {/* Staff Mobility */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Staff Mobility</h4>
                  <AnimatePresence>
                    {staffMobilities.map((m, i) => (
                      <motion.div 
                        key={i} 
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4"
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 10 }} 
                        transition={{ duration: 0.2 }}
                      >
                        <div>
                          <label className={labelClasses}>Name</label>
                          <input
                            placeholder="Name" 
                            value={m.name} 
                            onChange={e => {
                              const updated = [...staffMobilities]; 
                              updated[i].name = e.target.value; 
                              setStaffMobilities(updated);
                            }} 
                            className={inputClasses} 
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>Year</label>
                          <input
                            placeholder="Year" 
                            value={m.year} 
                            onChange={e => {
                              const updated = [...staffMobilities]; 
                              updated[i].year = e.target.value; 
                              setStaffMobilities(updated);
                            }} 
                            className={inputClasses} 
                          />
                        </div>
                        <div className="flex justify-end">
                          {staffMobilities.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => setStaffMobilities(staffMobilities.filter((_, idx) => idx !== i))} 
                              className={deleteButtonClasses}
                              aria-label="Remove staff mobility"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <button 
                    type="button" 
                    onClick={() => setStaffMobilities([...staffMobilities, { name: '', year: '' }])} 
                    className={`${buttonClasses} bg-gray-700 hover:bg-gray-800`}
                  >
                    + Add Staff Mobility
                  </button>
                </div>

                {/* Student Mobility */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Student Mobility</h4>
                  <AnimatePresence>
                    {studentMobilities.map((s, i) => (
                      <motion.div 
                        key={i} 
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4"
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 10 }} 
                        transition={{ duration: 0.2 }}
                      >
                        <div>
                          <label className={labelClasses}>Name</label>
                          <input
                            placeholder="Name" 
                            value={s.name} 
                            onChange={e => {
                              const updated = [...studentMobilities]; 
                              updated[i].name = e.target.value; 
                              setStudentMobilities(updated);
                            }} 
                            className={inputClasses} 
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>Year</label>
                          <input
                            placeholder="Year" 
                            value={s.year} 
                            onChange={e => {
                              const updated = [...studentMobilities]; 
                              updated[i].year = e.target.value; 
                              setStudentMobilities(updated);
                            }} 
                            className={inputClasses} 
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>Number of Students</label>
                          <input
                            placeholder="Number" 
                            value={s.number_of_students} 
                            onChange={e => {
                              const updated = [...studentMobilities]; 
                              updated[i].number_of_students = e.target.value; 
                              setStudentMobilities(updated);
                            }} 
                            className={inputClasses} 
                          />
                        </div>
                        <div className="flex justify-end">
                          {studentMobilities.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => setStudentMobilities(studentMobilities.filter((_, idx) => idx !== i))} 
                              className={deleteButtonClasses}
                              aria-label="Remove student mobility"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <button 
                    type="button" 
                    onClick={() => setStudentMobilities([...studentMobilities, { name: '', year: '', number_of_students: '' }])} 
                    className={`${buttonClasses} bg-gray-700 hover:bg-gray-800`}
                  >
                    + Add Student Mobility
                  </button>
                </div>

                {/* Joint Supervision */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Joint Supervision</h4>
                  <AnimatePresence>
                    {jointSupervisions.map((j, i) => (
                      <motion.div 
                        key={i} 
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4"
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 10 }} 
                        transition={{ duration: 0.2 }}
                      >
                        <div>
                          <label className={labelClasses}>Name</label>
                          <input
                            placeholder="Name" 
                            value={j.name} 
                            onChange={e => {
                              const updated = [...jointSupervisions]; 
                              updated[i].name = e.target.value; 
                              setJointSupervisions(updated);
                            }} 
                            className={inputClasses} 
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>Year</label>
                          <input
                            placeholder="Year" 
                            value={j.year} 
                            onChange={e => {
                              const updated = [...jointSupervisions]; 
                              updated[i].year = e.target.value; 
                              setJointSupervisions(updated);
                            }} 
                            className={inputClasses} 
                          />
                        </div>
                        <div className="flex justify-end">
                          {jointSupervisions.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => setJointSupervisions(jointSupervisions.filter((_, idx) => idx !== i))} 
                              className={deleteButtonClasses}
                              aria-label="Remove joint supervision"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <button 
                    type="button" 
                    onClick={() => setJointSupervisions([...jointSupervisions, { name: '', year: '' }])} 
                    className={`${buttonClasses} bg-gray-700 hover:bg-gray-800`}
                  >
                    + Add Joint Supervision
                  </button>
                </div>
              </>
            )}

            {/* Research Collaboration Fields */}
            {form.research_collab && (
              <>
                {/* Joint Research */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Joint Research</h4>
                  <AnimatePresence>
                    {jointResearches.map((r, i) => (
                      <motion.div 
                        key={i} 
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4"
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 10 }} 
                        transition={{ duration: 0.2 }}
                      >
                        <div>
                          <label className={labelClasses}>Name</label>
                          <input
                            placeholder="Name" 
                            value={r.name} 
                            onChange={e => {
                              const updated = [...jointResearches]; 
                              updated[i].name = e.target.value; 
                              setJointResearches(updated);
                            }} 
                            className={inputClasses} 
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>Year</label>
                          <input
                            placeholder="Year" 
                            value={r.year} 
                            onChange={e => {
                              const updated = [...jointResearches]; 
                              updated[i].year = e.target.value; 
                              setJointResearches(updated);
                            }} 
                            className={inputClasses} 
                          />
                        </div>
                        <div className="flex justify-end">
                          {jointResearches.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => setJointResearches(jointResearches.filter((_, idx) => idx !== i))} 
                              className={deleteButtonClasses}
                              aria-label="Remove joint research"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <button 
                    type="button" 
                    onClick={() => setJointResearches([...jointResearches, { name: '', year: '' }])} 
                    className={`${buttonClasses} bg-gray-700 hover:bg-gray-800`}
                  >
                    + Add Joint Research
                  </button>
                </div>

                {/* Joint Publication */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Joint Publication</h4>
                  <AnimatePresence>
                    {jointPublications.map((p, i) => (
                      <motion.div 
                        key={i} 
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4"
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 10 }} 
                        transition={{ duration: 0.2 }}
                      >
                        <div>
                          <label className={labelClasses}>Publisher</label>
                          <input
                            placeholder="Publisher" 
                            value={p.publisher} 
                            onChange={e => {
                              const updated = [...jointPublications]; 
                              updated[i].publisher = e.target.value; 
                              setJointPublications(updated);
                            }} 
                            className={inputClasses} 
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>Author</label>
                          <input
                            placeholder="Author" 
                            value={p.author} 
                            onChange={e => {
                              const updated = [...jointPublications]; 
                              updated[i].author = e.target.value; 
                              setJointPublications(updated);
                            }} 
                            className={inputClasses} 
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>Year</label>
                          <input
                            placeholder="Year" 
                            value={p.year} 
                            onChange={e => {
                              const updated = [...jointPublications]; 
                              updated[i].year = e.target.value; 
                              setJointPublications(updated);
                            }} 
                            className={inputClasses} 
                          />
                        </div>
                        <div className="flex justify-end">
                          {jointPublications.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => setJointPublications(jointPublications.filter((_, idx) => idx !== i))} 
                              className={deleteButtonClasses}
                              aria-label="Remove joint publication"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <button 
                    type="button" 
                    onClick={() => setJointPublications([...jointPublications, { publisher: '', author: '', year: '' }])} 
                    className={`${buttonClasses} bg-gray-700 hover:bg-gray-800`}
                  >
                    + Add Joint Publication
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Dates & PIC Section */}
          <div className={sectionClasses}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Dates & Personnel</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['start_date','end_date'].map(fd=>(
                <div key={fd}>
                  <label className={labelClasses}>
                    {fd==='start_date'?'Start Date':'End Date'}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input 
                    type="date" 
                    required 
                    value={form[fd]} 
                    onChange={e=>handleFormChange(fd,e.target.value)} 
                    className={inputClasses} 
                  />
                </div>
              ))}
              
              {['i_kohza','pic_mjiit'].map(fld=>(
                <div key={fld}>
                  <label className={labelClasses}>
                    {fld==='i_kohza'?'Collaborating iKohza':'PIC at MJIIT'}
                  </label>
                  <input
                    value={form[fld]} 
                    onChange={e=>handleFormChange(fld,e.target.value)} 
                    className={inputClasses} 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Other Details Section */}
          <div className={sectionClasses}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Other Details</h3>
            
            <AnimatePresence>
              {others.map((o,i)=>(
                <motion.div 
                  key={i} 
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4"
                  initial={{opacity:0,y:-10}} 
                  animate={{opacity:1,y:0}} 
                  exit={{opacity:0,y:10}} 
                  transition={{duration:0.2}}
                >
                  <div>
                    <label className={labelClasses}>Field Name</label>
                    <input
                      placeholder="Field Name" 
                      value={o.field} 
                      onChange={e=>updateOther(i,'field',e.target.value)} 
                      className={inputClasses} 
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Value</label>
                    <input
                      placeholder="Value" 
                      value={o.value} 
                      onChange={e=>updateOther(i,'value',e.target.value)} 
                      className={inputClasses} 
                    />
                  </div>
                  <div className="flex justify-end">
                    {others.length>1 && (
                      <button 
                        type="button" 
                        onClick={()=>removeOther(i)} 
                        className={deleteButtonClasses}
                        aria-label="Remove other detail"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <button 
              type="button" 
              onClick={addOther} 
              className={`${buttonClasses} bg-gray-700 hover:bg-gray-800`}
            >
              + Add Field
            </button>
          </div>


          {/* Submit Section */}
          <div className="flex justify-end">
            <button 
              type="submit" 
              className={`${buttonClasses} px-8 py-3 text-lg font-semibold`}
            >
              Submit Agreement
            </button>
          </div>

          <div className="flex justify-end">
          <button type="button" onClick={clearAllFields} className={`${buttonClasses} ml-4 bg-red-700 hover:bg-red-800`}>
        Clear All
       </button>
       </div>
  
          
          {message && (
            <motion.div 
              className={`p-4 rounded-lg ${message.includes('success') ? 'bg-green-500' : 'bg-red-500'} text-white shadow-lg`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {message}
            </motion.div>
          )}

        </form>
      </div>
      
    </Sidebar>

  );}