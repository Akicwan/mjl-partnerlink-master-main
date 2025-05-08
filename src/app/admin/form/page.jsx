"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../../components/Sidebar';
import { supabase } from '../../lib/supabaseClient'; // Adjust the import path as necessary

export default function AgreementForm() {
  const router = useRouter();

  const [contacts, setContacts] = useState([{ name: '', email: '' }]);
  const [others, setOthers] = useState([{ fieldName: '', value: '' }]);
  const [form, setForm] = useState({
    university: '',
    abbreviation: '',
    jucMember: null,
    agreementType: '',
    academicCollab: false,
    researchCollab: false,
    startDate: '',
    endDate: '',
    iKohza: '',
    picMJIIT: '',
    jd_dd: '',
    joint_lab: '',
    co_teaching: '',
    staff_mobility: '',
    student_mobility: '',
    joint_supervision: '',
    joint_research: '',
    joint_publication: ''
  });

  const [userEmail, setUserEmail] = useState(null);

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

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleCheckbox = (field) => {
    setForm(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const addContact = () => setContacts([...contacts, { name: '', email: '' }]);
  const updateContact = (idx, field, value) => {
    setContacts(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };
  const removeContact = idx => {
    setContacts(prev => prev.filter((_, i) => i !== idx));
  };

  const addOther = () => setOthers([...others, { fieldName: '', value: '' }]);
  const updateOther = (idx, field, value) => {
    setOthers(prev => prev.map((o, i) => i === idx ? { ...o, [field]: value } : o));
  };
  const removeOther = idx => {
    setOthers(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const payload = { ...form, contacts, others };
    console.log(payload);
  };

  const inputClasses = "transition-all duration-200 ease-in-out w-full bg-[#692B2C] text-white border-none rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 hover:scale-[1.02]";
  const buttonClasses = "transition-all duration-200 ease-in-out px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 active:scale-95";
  const deleteButtonClasses = "transition-all duration-200 ease-in-out w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 active:scale-90";


  return (
    <Sidebar role="admin" email={userEmail}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-semibold text-black">Agreement Details</h2>

        <div className="grid grid-cols-2 gap-4">
          {['university', 'abbreviation'].map((field, i) => (
            <div key={field}>
              <label className="block font-medium text-black capitalize">{field.replace(/([A-Z])/g, ' $1')} <span className="text-red-500">*</span></label>
              <input
                required
                value={form[field]}
                onChange={e => handleFormChange(field, e.target.value)}
                className={inputClasses}
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className="block font-medium text-black">Contact Person <span className="text-red-500">*</span></label>
          <AnimatePresence>
            {contacts.map((c, i) => (
              <motion.div
                key={i}
                className="grid grid-cols-3 gap-4 items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  type="text"
                  placeholder="Name"
                  required
                  value={c.name}
                  onChange={e => updateContact(i, 'name', e.target.value)}
                  className={inputClasses}
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={c.email}
                  onChange={e => updateContact(i, 'email', e.target.value)}
                  className={inputClasses}
                />
                {contacts.length > 1 && (
                  <button type="button" onClick={() => removeContact(i)} className={deleteButtonClasses}>×</button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <button
            type="button"
            onClick={addContact}
            className={buttonClasses}
          >
            + Add Contact
          </button>
        </div>

        <div>
          <label className="block font-medium text-black">JUC Member <span className="text-red-500">*</span></label>
          <div className="flex gap-4 mt-1">
            <label className="text-black"><input type="radio" required onChange={() => handleFormChange('jucMember', true)} checked={form.jucMember === true} /> Yes</label>
            <label className="text-black"><input type="radio" required onChange={() => handleFormChange('jucMember', false)} checked={form.jucMember === false} /> No</label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-black">Agreement Type <span className="text-red-500">*</span></label>
            <input
              required
              value={form.agreementType}
              onChange={e => handleFormChange('agreementType', e.target.value)}
              className={inputClasses}
            />
          </div>
          <br />
          <div>
            <label className="block font-medium text-black">Academic Collaboration</label>
            <input
              type="checkbox"
              checked={form.academicCollab}
              onChange={() => toggleCheckbox('academicCollab')}
            />
          </div>
        </div>

        <AnimatePresence>
          {form.academicCollab && (
            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {['jd_dd', 'joint_lab', 'co_teaching', 'staff_mobility', 'student_mobility', 'joint_supervision'].map(field => (
                <div key={field}>
                  <label className="block font-medium text-black capitalize">{field.replace(/_/g, ' ')}</label>
                  <input
                    value={form[field]}
                    onChange={e => handleFormChange(field, e.target.value)}
                    className={inputClasses}
                  />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label className="block font-medium text-black">Research Collaboration</label>
          <input
            type="checkbox"
            checked={form.researchCollab}
            onChange={() => toggleCheckbox('researchCollab')}
          />
        </div>

        <AnimatePresence>
          {form.researchCollab && (
            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {['joint_research', 'joint_publication'].map(field => (
                <div key={field}>
                  <label className="block font-medium text-black capitalize">{field.replace(/_/g, ' ')}</label>
                  <input
                    value={form[field]}
                    onChange={e => handleFormChange(field, e.target.value)}
                    className={inputClasses}
                  />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-4">
          {['startDate', 'endDate'].map((field, i) => (
            <div key={field}>
              <label className="block font-medium text-black">Agreement {field === 'startDate' ? 'Start' : 'End'} Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                value={form[field]}
                onChange={e => handleFormChange(field, e.target.value)}
                className={inputClasses}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {['iKohza', 'picMJIIT'].map(field => (
            <div key={field}>
              <label className="block font-medium text-black">{field === 'iKohza' ? 'Collaborating iKohza' : 'PIC at MJIIT'}</label>
              <input
                value={form[field]}
                onChange={e => handleFormChange(field, e.target.value)}
                className={inputClasses}
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className="block font-medium text-black">Other Details</label>
          <AnimatePresence>
            {others.map((o, i) => (
              <motion.div
                key={i}
                className="grid grid-cols-3 gap-4 items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  type="text"
                  placeholder="Field Name"
                  value={o.fieldName}
                  onChange={e => updateOther(i, 'fieldName', e.target.value)}
                  className={inputClasses}
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={o.value}
                  onChange={e => updateOther(i, 'value', e.target.value)}
                  className={inputClasses}
                />
                {others.length > 1 && (
                  <button type="button" onClick={() => removeOther(i)} className={deleteButtonClasses}>×</button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <button
            type="button"
            onClick={addOther}
            className={buttonClasses}
          >
            + Add Field
          </button>
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="submit"
            className="transition-all duration-200 ease-in-out px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 active:scale-95"
          >
            Submit
          </button>
        </div>

      </form>
    </Sidebar>
  );
}
