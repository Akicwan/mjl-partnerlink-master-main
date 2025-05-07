'use client';

import { useRouter } from 'next/navigation';

export default function PublicDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#692B2C] p-6">
     
      <div className="bg-[#1F2163] text-white px-6 py-4 rounded-t-2xl shadow-md max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Public Dashboard</h1>
          <button
            onClick={() => router.push('/login')}
            className="bg-[#D9AC42] text-white px-4 py-2 rounded-lg shadow hover:bg-[#c6983b] transition"
          >
            Login
          </button>
        </div>
      </div>

      
      <div className="bg-white rounded-b-2xl shadow-xl p-6 max-w-6xl mx-auto min-h-[70vh]">
        <h2 className="text-2xl font-semibold text-[#1F2163] mb-6">
          Welcome to the MJL Public Dashboard
        </h2>

       
        <p className="text-gray-700">
        Only the public parts are displayed here. Please log in to view or manage more details.
        </p>
      </div>
    </div>
  );
}