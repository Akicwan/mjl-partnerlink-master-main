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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

const CustomizedTick = ({ x, y, payload }) => {
  const lines = payload.value.split('\n');
  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, index) => (
        <text
          key={index}
          x={0}
          y={index * 12}
          dy={16}
          textAnchor="middle"
          fill="#666"
          fontSize={11}
        >
          {line}
        </text>
      ))}
    </g>
  );
};

const wrapLabel = (label) => {
  return label.length > 25
    ? label.replace(/\s(.{5,})$/, "\n$1")
    : label;
};

export default function AdminDashboard() {
  const [userEmail, setUserEmail] = useState(null);
  const [agreementData, setAgreementData] = useState([]);
  const [recentAgreements, setRecentAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

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
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch agreements data
        const { data: allData, error: allError } = await supabase
          .from('agreements_2')
          .select('id, university');

        if (allError) {
          throw new Error(`Agreements fetch error: ${allError.message}`);
        }

        // 2. Initialize university map with agreements count
        const universityMap = new Map();
        allData.forEach(agreement => {
          const uni = agreement.university || 'Unknown';
          if (!universityMap.has(uni)) {
            universityMap.set(uni, {
              agreements: 0,
              activities: 0
            });
          }
          universityMap.get(uni).agreements++;
        });

        // 3. Try to fetch activities if table exists
        try {
          const { data: activities, error: activitiesError } = await supabase
            .from('activities')
            .select('agreement_id');

          if (!activitiesError && activities) {
            // Count activities per university
            activities.forEach(activity => {
              const agreement = allData.find(a => a.id === activity.agreement_id);
              if (agreement) {
                const uni = agreement.university || 'Unknown';
                if (universityMap.has(uni)) {
                  universityMap.get(uni).activities++;
                }
              }
            });
          }
        } catch (activitiesErr) {
          console.warn("Activities table not found or error fetching activities. Using zero values.");
          // If activities table doesn't exist, just continue with zero values
        }

        // 4. Convert to array format for chart
        const formatted = Array.from(universityMap.entries()).map(([university, counts]) => ({
          university: wrapLabel(university),
          agreements: counts.agreements,
          activities: counts.activities
        }));

        setAgreementData(formatted);

        // 5. Fetch recent agreements
        const { data: recent, error: recentError } = await supabase
          .from('agreements_2')
          .select('university, agreement_type, start_date, end_date')
          .order('start_date', { ascending: false })
          .limit(4);

        if (!recentError) {
          setRecentAgreements(recent);
        }

      } catch (err) {
        console.error("Data fetch error:", err);
        setError(err.message);
        setAgreementData([]);
        setRecentAgreements([]);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) fetchData();
  }, [userEmail]);

  const totalAgreements = agreementData.reduce((sum, item) => sum + item.agreements, 0);
  const totalActivities = agreementData.reduce((sum, item) => sum + item.activities, 0);

  if (!userEmail || loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <Sidebar role="admin" email={userEmail}>
      <div className="text-black p-6 bg-white rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-[#1F2163] mb-6">Admin Dashboard</h1>

        {agreementData.length === 0 ? (
          <p>No agreements found.</p>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Chart + Summary */}
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-5/6 h-[400px] bg-white p-4 rounded-2xl shadow-md border border-gray-100">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={agreementData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="university"
                      interval={0}
                      height={60}
                      tick={<CustomizedTick />}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        value, 
                        name === 'agreements' ? 'Agreements' : 'Activities'
                      ]}
                    />
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

              <div className="w-full lg:w-1/6 flex flex-col gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#1F2163]">Total Agreements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-[#3A86FF]">{totalAgreements}</p>
                    <p className="text-sm text-gray-500 mt-1">{agreementData.length} universities</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#1F2163]">Total Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-[#FF9F1C]">{totalActivities}</p>
                    <p className="text-sm text-gray-500 mt-1">Across all agreements</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Agreements Table */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-[#1F2163]">Recent Agreements</h2>
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
                  {recentAgreements.map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-gray-50">
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
          </div>
        )}
      </div>
    </Sidebar>
  );
}