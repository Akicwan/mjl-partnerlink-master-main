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
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
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

  const openModal = (agreement) => {
    setSelectedAgreement(agreement);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedAgreement(null), 300);
  };

  if (!userEmail || loading) return <p className="p-6">Loading...</p>;

  return (
    <Sidebar role="admin" email={userEmail}>
      <div className="relative text-black p-6 bg-white rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-[#1F2163] mb-6">Agreements</h1>

        {agreements.length === 0 ? (
          <p>No agreements found.</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-[#1F2163]"></h2>

            <Table>
              <TableHeader>
                <TableRow className="bg-[#f3f4f6] text-[#1F2163]">
                  <TableHead className="font-semibold">University</TableHead>
                  <TableHead className="font-semibold">Agreement Type</TableHead>
                  <TableHead className="font-semibold">Start Date</TableHead>
                  <TableHead className="font-semibold">End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agreements.map((item, idx) => (
                  <TableRow
                    key={idx}
                    onClick={() => openModal(item)}
                    className="hover:bg-gray-100 cursor-pointer transition duration-150"
                  >
                    <TableCell>{item.university}</TableCell>
                    <TableCell>{item.agreement_type}</TableCell>
                    <TableCell>
                      {new Date(item.start_date).toLocaleDateString('en-MY', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      {new Date(item.end_date).toLocaleDateString('en-MY', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && selectedAgreement && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div
            className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full animate-fadeInScale"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold text-[#1F2163] mb-4">Agreement Details</h2>
            <p><strong>University:</strong> {selectedAgreement.university}</p>
            <p><strong>Agreement Type:</strong> {selectedAgreement.agreement_type}</p>
            <p><strong>Start Date:</strong> {new Date(selectedAgreement.start_date).toLocaleDateString('en-MY', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}</p>
            <p><strong>End Date:</strong> {new Date(selectedAgreement.end_date).toLocaleDateString('en-MY', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}</p>

            <div className="mt-6 text-right">
              <button
                onClick={closeModal}
                className="bg-[#D9AC42] hover:bg-[#FFB347] transition-all text-white py-2 px-4 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tailwind animation */}
      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeInScale {
          animation: fadeInScale 0.3s ease-out forwards;
        }
      `}</style>
    </Sidebar>
  );
}
