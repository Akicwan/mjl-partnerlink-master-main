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
  const [others, setOthers] = useState([{ fieldName: '', value: '' }]);
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

  const inputClasses = "transition-all duration-200 ease-in-out w-full bg-[#5A261F] text-white border-none rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 hover:scale-[1.02] resize-y";
  const buttonClasses = "transition-all duration-200 ease-in-out px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 active:scale-95";
  const deleteButtonClasses = "transition-all duration-200 ease-in-out w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 active:scale-90";

  const handleFormChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const toggleCheckbox = field => setForm(prev => ({ ...prev, [field]: !prev[field] }));

  const addContact = () => setContacts(prev => [...prev, { name: '', email: '' }]);
  const updateContact = (i, f, v) => setContacts(prev => prev.map((c, idx) => idx === i ? { ...c, [f]: v } : c));
  const removeContact = i => setContacts(prev => prev.filter((_, idx) => idx !== i));

  const addOther = () => setOthers(prev => [...prev, { fieldName: '', value: '' }]);
  const updateOther = (i, f, v) => setOthers(prev => prev.map((o, idx) => idx === i ? { ...o, [f]: v } : o));
  const removeOther = i => setOthers(prev => prev.filter((_, idx) => idx !== i));

  const addCoTeaching = () => setCoTeachings(prev => [...prev, { name: '', year: '' }]);
  const updateCoTeaching = (i, f, v) => setCoTeachings(prev => prev.map((c, idx) => idx === i ? { ...c, [f]: v } : c));
  const removeCoTeaching = i => setCoTeachings(prev => prev.filter((_, idx) => idx !== i));

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
      setTimeout(() => window.location.reload(), 3000);
    }
  };



  return (
    <Sidebar role="admin" email={userEmail}>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-semibold text-black">Agreement Details</h2>

          <div className="grid grid-cols-2 gap-4">
            {['university','abbreviation'].map(field=>(
              <div key={field}>
                <label className="block font-medium text-black capitalize">{field}<span className="text-red-500">*</span></label>
                <textarea required rows={2} value={form[field]} onChange={e=>handleFormChange(field,e.target.value)} className={inputClasses} />
              </div>
            ))}
            <div>
              <label className="block font-medium text-black">Agreement Type<span className="text-red-500">*</span></label>
              <input list="agreementTypes" value={form.agreement_type} onChange={e=>handleFormChange('agreement_type', e.target.value)} className={inputClasses.replace('resize-y','')} required />
              <datalist id="agreementTypes">
                {agreementOptions.map(opt => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Contacts */}
          <div className="space-y-2">
            <label className="block font-medium text-black">Contact Person<span className="text-red-500">*</span></label>
            <AnimatePresence>
              {contacts.map((c,i)=>(
                <motion.div key={i} className="grid grid-cols-3 gap-4 items-center"
                  initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} transition={{duration:0.2}}>
                  <textarea placeholder="Name" required value={c.name} onChange={e=>updateContact(i,'name',e.target.value)} className={inputClasses} rows={1} />
                  <textarea placeholder="Email" required value={c.email} onChange={e=>updateContact(i,'email',e.target.value)} className={inputClasses} rows={1} />
                  {contacts.length>1&&<button type="button" onClick={()=>removeContact(i)} className={deleteButtonClasses}>×</button>}
                </motion.div>
              ))}
            </AnimatePresence>
            <button type="button" onClick={addContact} className={buttonClasses}>+ Add Contact</button>
          </div>

          <div>
            <label className="block font-medium text-black">JUC Member <span className="text-red-500">*</span></label>
            <div className="flex gap-4 mt-1">
              <label className="text-black"><input type="radio" required onChange={() => handleFormChange('juc_member', true)} checked={form.juc_member === true} /> Yes</label>
              <label className="text-black"><input type="radio" required onChange={() => handleFormChange('juc_member', false)} checked={form.juc_member === false} /> No</label>
            </div>
          </div>

          {/* Collaboration toggles */}
          <div className="flex gap-4">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={form.academic_collab} onChange={()=>toggleCheckbox('academic_collab')} /> <span>Academic Collaboration</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={form.research_collab} onChange={()=>toggleCheckbox('research_collab')} /> <span>Research Collaboration</span>
            </label>
          </div>

          {form.academic_collab && (
            <div className="grid grid-cols-2 gap-4">
              {['jd_dd','joint_lab'].map(f => {
              const labelMap = {
                jd_dd: 'Join Degree / Double Degree',
                joint_lab: 'Joint lab'
              };
  return (
    <div key={f}>
      <label className="block font-medium text-black">{labelMap[f]}</label>
      <textarea rows={1} value={form[f]} onChange={e => handleFormChange(f, e.target.value)} className={inputClasses} />
    </div>
  );
})}
</div>
)}
{form.academic_collab && (
            <div className="space-y-2">
              <label className="block font-medium text-black">Co-Teaching</label>
              <AnimatePresence>
                {coTeachings.map((c, i) => (
                  <motion.div key={i} className="grid grid-cols-3 gap-4 items-center"
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}>
                    <textarea placeholder="Name" value={c.name} onChange={e => updateCoTeaching(i, 'name', e.target.value)} className={inputClasses} rows={1} />
                    <textarea placeholder="Year" value={c.year} onChange={e => updateCoTeaching(i, 'year', e.target.value)} className={inputClasses} rows={1} />
                    {coTeachings.length > 1 && <button type="button" onClick={() => removeCoTeaching(i)} className={deleteButtonClasses}>×</button>}
                  </motion.div>
                ))}
              </AnimatePresence>
              <button type="button" onClick={addCoTeaching} className={buttonClasses}>+ Add Co-Teaching</button>
            </div>
)}

{form.academic_collab && (
<div className="space-y-2">
  <label className="block font-medium text-black">Staff Mobility</label>
  <AnimatePresence>
    {staffMobilities.map((m, i) => (
      <motion.div key={i} className="grid grid-cols-3 gap-4 items-center"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}>
        <textarea placeholder="Name" value={m.name} onChange={e => {
          const updated = [...staffMobilities]; updated[i].name = e.target.value; setStaffMobilities(updated);
        }} className={inputClasses} rows={1} />
        <textarea placeholder="Year" value={m.year} onChange={e => {
          const updated = [...staffMobilities]; updated[i].year = e.target.value; setStaffMobilities(updated);
        }} className={inputClasses} rows={1} />
        {staffMobilities.length > 1 && (
          <button type="button" onClick={() => setStaffMobilities(staffMobilities.filter((_, idx) => idx !== i))} className={deleteButtonClasses}>×</button>
        )}
      </motion.div>
    ))}
  </AnimatePresence>
  <button type="button" onClick={() => setStaffMobilities([...staffMobilities, { name: '', year: '' }])} className={buttonClasses}>+ Add Staff Mobility</button>
</div>
)}


{form.academic_collab && (
<div className="space-y-2">
  <label className="block font-medium text-black">Student Mobility</label>
  <AnimatePresence>
    {studentMobilities.map((s, i) => (
      <motion.div key={i} className="grid grid-cols-4 gap-4 items-center"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}>
        <textarea placeholder="Name" value={s.name} onChange={e => {
          const updated = [...studentMobilities]; updated[i].name = e.target.value; setStudentMobilities(updated);
        }} className={inputClasses} rows={1} />
        <textarea placeholder="Year" value={s.year} onChange={e => {
          const updated = [...studentMobilities]; updated[i].year = e.target.value; setStudentMobilities(updated);
        }} className={inputClasses} rows={1} />
        <textarea placeholder="Number of Students" value={s.number_of_students} onChange={e => {
          const updated = [...studentMobilities]; updated[i].number_of_students = e.target.value; setStudentMobilities(updated);
        }} className={inputClasses} rows={1} />
        {studentMobilities.length > 1 && (
          <button type="button" onClick={() => setStudentMobilities(studentMobilities.filter((_, idx) => idx !== i))} className={deleteButtonClasses}>×</button>
        )}
      </motion.div>
    ))}
  </AnimatePresence>
  <button type="button" onClick={() => setStudentMobilities([...studentMobilities, { name: '', year: '', number_of_students: '' }])} className={buttonClasses}>+ Add Student Mobility</button>
</div>
)}

{form.academic_collab && (
<div className="space-y-2">
  <label className="block font-medium text-black">Joint Supervision</label>
  <AnimatePresence>
    {jointSupervisions.map((j, i) => (
      <motion.div key={i} className="grid grid-cols-3 gap-4 items-center"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}>
        <textarea placeholder="Name" value={j.name} onChange={e => {
          const updated = [...jointSupervisions]; updated[i].name = e.target.value; setJointSupervisions(updated);
        }} className={inputClasses} rows={1} />
        <textarea placeholder="Year" value={j.year} onChange={e => {
          const updated = [...jointSupervisions]; updated[i].year = e.target.value; setJointSupervisions(updated);
        }} className={inputClasses} rows={1} />
        {jointSupervisions.length > 1 && (
          <button type="button" onClick={() => setJointSupervisions(jointSupervisions.filter((_, idx) => idx !== i))} className={deleteButtonClasses}>×</button>
        )}
      </motion.div>
    ))}
  </AnimatePresence>
  <button type="button" onClick={() => setJointSupervisions([...jointSupervisions, { name: '', year: '' }])} className={buttonClasses}>+ Add Joint Supervision</button>
</div>
)}

{form.research_collab && (
<div className="space-y-2">
  <label className="block font-medium text-black">Joint Research</label>
  <AnimatePresence>
    {jointResearches.map((r, i) => (
      <motion.div key={i} className="grid grid-cols-3 gap-4 items-center"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}>
        <textarea placeholder="Name" value={r.name} onChange={e => {
          const updated = [...jointResearches]; updated[i].name = e.target.value; setJointResearches(updated);
        }} className={inputClasses} rows={1} />
        <textarea placeholder="Year" value={r.year} onChange={e => {
          const updated = [...jointResearches]; updated[i].year = e.target.value; setJointResearches(updated);
        }} className={inputClasses} rows={1} />
        {jointResearches.length > 1 && (
          <button type="button" onClick={() => setJointResearches(jointResearches.filter((_, idx) => idx !== i))} className={deleteButtonClasses}>×</button>
        )}
      </motion.div>
    ))}
  </AnimatePresence>
  <button type="button" onClick={() => setJointResearches([...jointResearches, { name: '', year: '' }])} className={buttonClasses}>+ Add Joint Research</button>
</div>
)}

{form.research_collab && (
<div className="space-y-2">
  <label className="block font-medium text-black">Joint Publication</label>
  <AnimatePresence>
    {jointPublications.map((p, i) => (
      <motion.div key={i} className="grid grid-cols-4 gap-4 items-center"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}>
        <textarea placeholder="Publisher" value={p.publisher} onChange={e => {
          const updated = [...jointPublications]; updated[i].publisher = e.target.value; setJointPublications(updated);
        }} className={inputClasses} rows={1} />
        <textarea placeholder="Author" value={p.author} onChange={e => {
          const updated = [...jointPublications]; updated[i].author = e.target.value; setJointPublications(updated);
        }} className={inputClasses} rows={1} />
        <textarea placeholder="Year" value={p.year} onChange={e => {
          const updated = [...jointPublications]; updated[i].year = e.target.value; setJointPublications(updated);
        }} className={inputClasses} rows={1} />
        {jointPublications.length > 1 && (
          <button type="button" onClick={() => setJointPublications(jointPublications.filter((_, idx) => idx !== i))} className={deleteButtonClasses}>×</button>
        )}
      </motion.div>
    ))}
  </AnimatePresence>
  <button type="button" onClick={() => setJointPublications([...jointPublications, { publisher: '', author: '', year: '' }])} className={buttonClasses}>+ Add Joint Publication</button>
</div>
)}



          {/* Dates & PIC fields */}
          <div className="grid grid-cols-2 gap-4">
            {['start_date','end_date'].map(fd=>(
              <div key={fd}>
                <label className="block font-medium text-black">{fd==='start_date'?'Start Date':'End Date'}<span className="text-red-500">*</span></label>
                <input type="date" required value={form[fd]} onChange={e=>handleFormChange(fd,e.target.value)} className={inputClasses.replace('resize-y','')} />
              </div>
            ))}
            {['i_kohza','pic_mjiit'].map(fld=>(
              <div key={fld}>
                <label className="block font-medium text-black">{fld==='i_kohza'?'Collaborating iKohza':'PIC at MJIIT'}</label>
                <textarea rows={1} value={form[fld]} onChange={e=>handleFormChange(fld,e.target.value)} className={inputClasses} />
              </div>
            ))}
          </div>

          {/* Others Section */}
          <div className="space-y-2">
            <label className="block font-medium text-black">Other Details</label>
            <AnimatePresence>
              {others.map((o,i)=>(
                <motion.div key={i} className="grid grid-cols-3 gap-4 items-center"
                  initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} transition={{duration:0.2}}>
                  <textarea placeholder="Field Name" value={o.field} onChange={e=>updateOther(i,'field',e.target.value)} className={inputClasses} rows={1} />
                  <textarea placeholder="Value" value={o.value} onChange={e=>updateOther(i,'value',e.target.value)} className={inputClasses} rows={1} />
                  {others.length>1&&<button type="button" onClick={()=>removeOther(i)} className={deleteButtonClasses}>×</button>}
                </motion.div>
              ))}
            </AnimatePresence>
            <button type="button" onClick={addOther} className={buttonClasses}>+ Add Field</button>
          </div>

          <div className="pt-6">
            <button type="submit" className="transition-all duration-200 ease-in-out px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 active:scale-95">Submit Agreement</button>
          </div>
          {message && <div className="mb-4 p-3 bg-green-500 text-white rounded">{message}</div>}
        </form>
      </div>
    </Sidebar>
  );
}