'use client';
import '../../globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default function AgreementsPage() {
  const [userEmail, setUserEmail] = useState(null);
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDeleted, setLastDeleted] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleRowClick = (id) => {
    router.push(`/admin/agreements/${id}`);
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

  const filteredAgreements = agreements.filter(item =>
    item.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.agreement_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!userEmail || loading) return <p className="p-6">Loading...</p>;

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

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by university or type..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

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
                    className="hover:bg-gray-100 transition"
                  >
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => handleRowClick(item.id)}
                    >
                      {item.university}
                    </TableCell>
                    <TableCell>{item.agreement_type}</TableCell>
                    <TableCell>
                      {new Date(item.start_date).toLocaleDateString('en-MY')}
                    </TableCell>
                    <TableCell>
                      {new Date(item.end_date).toLocaleDateString('en-MY')}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleDelete(item.id)}
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
    </Sidebar>
  );
}

