'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboard() {
  const [userEmail, setUserEmail] = useState(null);
  const [agreementData, setAgreementData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const totalAgreements = agreementData.reduce((sum, item) => sum + item.agreements, 0);
  const totalActivities = agreementData.reduce((sum, item) => sum + item.activities, 0);

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

  useEffect(() => {
    const fetchAgreements = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('agreements')
        .select('id, university');

      if (error) {
        console.error("Error fetching agreements:", error);
        setAgreementData([]);
      } else {
        const grouped = data.reduce((acc, item) => {
          const uni = item.university || 'Unknown';
          acc[uni] = (acc[uni] || 0) + 1;
          return acc;
        }, {});

        const formatted = Object.entries(grouped).map(([university, agreements]) => ({
          university,
          agreements,
          activities: Math.floor(Math.random() * 10) + 1, // temporary placeholder
        }));

        setAgreementData(formatted);
      }

      setLoading(false);
    };

    if (userEmail) fetchAgreements();
  }, [userEmail]);

  if (!userEmail || loading) return <p className="p-6">Loading...</p>;

  return (
    <Sidebar role="admin" email={userEmail}>
      <div className="text-black p-6 bg-white rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-[#1F2163] mb-6">Admin Dashboard</h1>

        {agreementData.length === 0 ? (
          <p>No agreements found.</p>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Bar Graph */}
            <div className="w-full lg:w-2/3 h-[400px] bg-white p-4 rounded-2xl shadow-md border border-gray-100">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={agreementData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="university" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="agreements"
                    fill="#a0c4ff"
                    radius={[8, 8, 0, 0]}
                    name="Agreements"
                  />
                  <Bar
                    dataKey="activities"
                    fill="#ffd6a5"
                    radius={[8, 8, 0, 0]}
                    name="Activities"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Cards */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#1F2163]">Total Agreements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-[#3A86FF]">{totalAgreements}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#1F2163]">Total Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-[#FF9F1C]">{totalActivities}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
