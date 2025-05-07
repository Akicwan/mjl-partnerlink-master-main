'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient'; // adjust if path is different
import Sidebar from '../../components/Sidebar';

export default function AgreementForm() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push('/login');
      } else {
        setUserEmail(user.email);
      }
    };

    fetchUser();
  }, [router]);

  const [contacts, setContacts] = useState([{ name: '', email: '' }]);
  const [others, setOthers] = useState([{ fieldName: '', value: '' }]);

  const [form, setForm] = useState({
    university: '',
    abbreviation: '',
    jucMember: null,
    agreementType: '',
    academicCollab: '',
    researchCollab: '',
    startDate: '',
    endDate: '',
    iKohza: '',
    picMJIIT: ''
  });

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      university: form.university,
      abbreviation: form.abbreviation,
      juc_member: form.jucMember,
      agreement_type: form.agreementType,
      academic_collab: form.academicCollab,
      research_collab: form.researchCollab,
      start_date: form.startDate,
      end_date: form.endDate,
      i_kohza: form.iKohza,
      pic_mjiit: form.picMJIIT,
      contacts: contacts,
      others: others,
    };

    const { data, error } = await supabase
      .from('agreements')
      .insert([payload]);

    if (error) {
      console.error('Insert failed:', error.message);
      alert('Something went wrong. Please try again.');
    } else {
      alert('Agreement submitted successfully!');
      router.push('/admin');
    }
  };

  const handleCancel = () => {
    setForm({
      university: '',
      abbreviation: '',
      jucMember: null,
      agreementType: '',
      academicCollab: '',
      researchCollab: '',
      startDate: '',
      endDate: '',
      iKohza: '',
      picMJIIT: ''
    });
    setContacts([{ name: '', email: '' }]);
    setOthers([{ fieldName: '', value: '' }]);
  };

  if (!userEmail) return null;

  return (
    <Sidebar role="admin" email={userEmail}>
      <div className="flex justify-center items-center min-h-screen bg-white py-8">
        <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-semibold text-black">Agreement Details</h2>

            <div className="grid grid-cols-2 gap-4">
              {['university','abbreviation'].map((field, i) => (
                <div key={field}>
                  <label className="block font-medium text-black capitalize">
                    {field.replace(/([A-Z])/g,' $1')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={form[field]}
                    onChange={e => handleFormChange(field, e.target.value)}
                    className="w-full bg-[#692B2C] text-white border-none rounded px-3 py-2"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-black">Contact Person <span className="text-red-500">*</span></label>
              {contacts.map((c, i) => (
                <div key={i} className="grid grid-cols-3 gap-4 items-center">
                  <input
                    type="text"
                    placeholder="Name"
                    required
                    value={c.name}
                    onChange={e => updateContact(i, 'name', e.target.value)}
                    className="bg-[#692B2C] text-white border-none rounded px-3 py-2"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={c.email}
                    onChange={e => updateContact(i, 'email', e.target.value)}
                    className="bg-[#692B2C] text-white border-none rounded px-3 py-2"
                  />
                  {contacts.length > 1 && (
                    <button type="button" onClick={() => removeContact(i)} className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center">×</button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addContact}
                className="px-4 py-2 bg-blue-700 text-white rounded"
              >
                + Add Contact
              </button>
            </div>

            <div>
              <label className="block font-medium text-black">JUC Member <span className="text-red-500">*</span></label>
              <div className="flex gap-4 mt-1">
                <label className="text-black">
                  <input type="radio" required onChange={() => handleFormChange('jucMember', true)} checked={form.jucMember === true} /> Yes
                </label>
                <label className="text-black">
                  <input type="radio" required onChange={() => handleFormChange('jucMember', false)} checked={form.jucMember === false} /> No
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {['academicCollab','researchCollab'].map((field, i) => (
                <div key={field}>
                  <label className="block font-medium text-black">
                    {field.replace(/([A-Z])/g,' $1')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={form[field]}
                    onChange={e => handleFormChange(field, e.target.value)}
                    className="w-full bg-[#692B2C] text-white border-none rounded px-3 py-2"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block font-medium text-black">Agreement Type <span className="text-red-500">*</span></label>
              <select
                value={form.agreementType}
                onChange={e => handleFormChange('agreementType', e.target.value)}
                className="w-full bg-[#692B2C] text-white border-none rounded px-3 py-2"
                required
              >
                <option value="">Select Agreement Type</option>
                <option value="MOA">MOA</option>
                <option value="MOA Regional Conference Program Agreement">MOA Regional Conference Program Agreement</option>
                <option value="MOU">MOU</option>
                <option value="Cross Appointment">Cross Appointment</option>
                <option value="Academic Cooperation">Academic Cooperation</option>
                <option value="Outsourcing Agreement">Outsourcing Agreement</option>
                <option value="Satellite Office">Satellite Office</option>
                <option value="Exchange Agreement">Exchange Agreement</option>
                <option value="Agreement">Agreement</option>
                <option value="Academic Agreement">Academic Agreement</option>
                <option value="Collaborative Research Agreement Biological Soil Crust (BSC)">Collaborative Research Agreement Biological Soil Crust (BSC)</option>
                <option value="LOA & Outsourcing Agreement">LOA & Outsourcing Agreement (two agreement types)</option>
                <option value="CRA">CRA</option>
                <option value="SEA">SEA</option>
                <option value="LOA">LOA</option>
                <option value="LOC">LOC</option>
                <option value="LOI">LOI</option>
                <option value="JRA">JRA</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {['startDate','endDate'].map((field, i) => (
                <div key={field}>
                  <label className="block font-medium text-black">
                    Agreement {field === 'startDate' ? 'Start' : 'End'} Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form[field]}
                    onChange={e => handleFormChange(field, e.target.value)}
                    className="w-full bg-[#692B2C] text-white border-none rounded px-3 py-2"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {['iKohza','picMJIIT'].map(field => (
                <div key={field}>
                  <label className="block font-medium text-black">
                    {field === 'iKohza' ? 'Collaborating iKohza' : 'PIC at MJIIT'}
                  </label>
                  <input
                    value={form[field]}
                    onChange={e => handleFormChange(field, e.target.value)}
                    className="w-full bg-[#692B2C] text-white border-none rounded px-3 py-2"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-black">Others</label>
              {others.map((o, i) => (
                <div key={i} className="grid grid-cols-3 gap-4 items-center">
                  <input
                    placeholder="Field Name"
                    value={o.fieldName}
                    onChange={e => updateOther(i, 'fieldName', e.target.value)}
                    className="bg-[#692B2C] text-white border-none rounded px-3 py-2"
                  />
                  <input
                    placeholder="Value"
                    value={o.value}
                    onChange={e => updateOther(i, 'value', e.target.value)}
                    className="bg-[#692B2C] text-white border-none rounded px-3 py-2"
                  />
                  {others.length > 1 && (
                    <button type="button" onClick={() => removeOther(i)} className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center">×</button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addOther}
                className="px-4 py-2 bg-blue-700 text-white rounded"
              >
                + Add Field
              </button>
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={handleCancel}  // Reset the form when clicked
                className="px-6 py-2 bg-red-600 text-white rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-yellow-500 text-white rounded"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </Sidebar>
  );
}
