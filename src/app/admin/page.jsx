'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AdminDashboard() {
  const [userEmail, setUserEmail] = useState(null);
  const [mobilityData, setMobilityData] = useState([]);
  const [jointData, setJointData] = useState([]);
  const [coTeachingData, setCoTeachingData] = useState([]);
  const [totalAgreements, setTotalAgreements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
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
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: agreements, error: agreementsError } = await supabase
          .from('agreements_2')
          .select('student_mobility, staff_mobility, joint_research, joint_publication, co_teaching, joint_supervision');

        if (agreementsError) throw new Error(agreementsError.message);

        setTotalAgreements(agreements.length);

        const mobilityTotals = {};
        const jointTotals = {};
        const coTeachingTotals = {};

        agreements.forEach((agreement) => {
          (agreement.student_mobility || []).forEach(({ year, number_of_students }) => {
            const y = parseInt(year ?? '');
            const students = parseInt(number_of_students ?? '');
            if (!isNaN(y) && !isNaN(students)) {
              if (!mobilityTotals[y]) mobilityTotals[y] = { year: y, students: 0, staff: 0 };
              mobilityTotals[y].students += students;
            }
          });

          (agreement.staff_mobility || []).forEach(({ year }) => {
            const y = parseInt(year ?? '');
            if (!isNaN(y)) {
              if (!mobilityTotals[y]) mobilityTotals[y] = { year: y, students: 0, staff: 0 };
              mobilityTotals[y].staff += 1;
            }
          });

          (agreement.joint_research || []).forEach(({ year }) => {
            const y = parseInt(year ?? '');
            if (!isNaN(y)) {
              if (!jointTotals[y]) jointTotals[y] = { year: y, joint_research: 0, joint_publication: 0 };
              jointTotals[y].joint_research += 1;
            }
          });

          (agreement.joint_publication || []).forEach(({ year }) => {
            const y = parseInt(year ?? '');
            if (!isNaN(y)) {
              if (!jointTotals[y]) jointTotals[y] = { year: y, joint_research: 0, joint_publication: 0 };
              jointTotals[y].joint_publication += 1;
            }
          });

          (agreement.co_teaching || []).forEach(({ year }) => {
            const y = parseInt(year ?? '');
            if (!isNaN(y)) {
              if (!coTeachingTotals[y]) coTeachingTotals[y] = { year: y, co_teaching: 0, joint_supervision: 0 };
              coTeachingTotals[y].co_teaching += 1;
            }
          });

          (agreement.joint_supervision || []).forEach(({ year }) => {
            const y = parseInt(year ?? '');
            if (!isNaN(y)) {
              if (!coTeachingTotals[y]) coTeachingTotals[y] = { year: y, co_teaching: 0, joint_supervision: 0 };
              coTeachingTotals[y].joint_supervision += 1;
            }
          });
        });

        setMobilityData(Object.values(mobilityTotals).sort((a, b) => a.year - b.year));
        setJointData(Object.values(jointTotals).sort((a, b) => a.year - b.year));
        setCoTeachingData(Object.values(coTeachingTotals).sort((a, b) => a.year - b.year));
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) fetchData();
  }, [userEmail]);

  const totalStudents = mobilityData.reduce((sum, item) => sum + item.students, 0);
  const totalStaff = mobilityData.reduce((sum, item) => sum + item.staff, 0);
  const totalJointResearch = jointData.reduce((sum, item) => sum + item.joint_research, 0);
  const totalJointPublication = jointData.reduce((sum, item) => sum + item.joint_publication, 0);
  const totalCoTeaching = coTeachingData.reduce((sum, item) => sum + item.co_teaching, 0);
  const totalJointSupervision = coTeachingData.reduce((sum, item) => sum + item.joint_supervision, 0);

  const summaryCards = (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 w-full">
      {[
        { label: 'Total Students', value: totalStudents },
        { label: 'Total Staff', value: totalStaff },
        { label: 'Joint Research', value: totalJointResearch },
        { label: 'Joint Publication', value: totalJointPublication },
        { label: 'Co-Teaching', value: totalCoTeaching },
        { label: 'Joint Supervision', value: totalJointSupervision },
        { label: 'Total Agreements', value: totalAgreements }
      ].map(({ label, value }) => (
        <Card key={label}>
          <CardHeader>
            <CardTitle className="text-md">{label}</CardTitle>
            <p className="text-2xl font-bold">{value}</p>
          </CardHeader>
        </Card>
      ))}
    </div>
  );

  const mobilityCards = (
    <div className="mt-4" style={{ width: '1000px', marginLeft: '450px' }}>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

      {[
        { label: 'Total Students', value: totalStudents },
        { label: 'Total Staff', value: totalStaff },
        
      ].map(({ label, value }) => (
        <Card key={label}>
          <CardHeader>
            <CardTitle className="text-md">{label}</CardTitle>
            <p className="text-2xl font-bold">{value}</p>
          </CardHeader>
        </Card>
      ))}
    </div>
    </div>
  );

  const jointCards = (
    <div className="mt-4" style={{ width: '1000px', marginLeft: '450px' }}>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

      {[
        { label: 'Joint Research', value: totalJointResearch },
        { label: 'Joint Publication', value: totalJointPublication },
        
      ].map(({ label, value }) => (
        <Card key={label}>
          <CardHeader>
            <CardTitle className="text-md">{label}</CardTitle>
            <p className="text-2xl font-bold">{value}</p>
          </CardHeader>
        </Card>
      ))}
    </div>
    </div>
  );

  const coteachingsuperCards = (
    <div className="mt-4" style={{ width: '1000px', marginLeft: '450px' }}>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

      {[
        { label: 'Co-Teaching', value: totalCoTeaching },
        { label: 'Joint Supervision', value: totalJointSupervision },
        
      ].map(({ label, value }) => (
        <Card key={label}>
          <CardHeader>
            <CardTitle className="text-md">{label}</CardTitle>
            <p className="text-2xl font-bold">{value}</p>
          </CardHeader>
        </Card>
      ))}
    </div>
    </div>
  );

  const renderChart = (title, data, bars) => (
    <Card className="h-[400px] w-full md:w-[60%] mx-auto">
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            {bars}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  if (!userEmail || loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1F2163]"></div>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    </div>
  );

  return (
    <Sidebar role="admin" email={userEmail}>
      <div className="p-6">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-[#1F2163] to-[#161A42] p-8 rounded-xl shadow-lg mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-blue-100 mt-2">Comprehensive overview of partnership activities</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          {['all', 'mobility', 'joint', 'coTeaching'].map((key) => (
            <button
              key={key}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedFilter === key 
                  ? 'bg-[#1F2163] text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedFilter(key)}
            >
              {{
                all: 'All Activities',
                mobility: 'Mobility Data',
                joint: 'Research & Publications',
                coTeaching: 'Teaching & Supervision'
              }[key]}
            </button>
          ))}
        </div>

        {/* Dashboard Content */}
        <div className="space-y-8">
          {/* All Activities View */}
          {selectedFilter === 'all' && (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Total Agreements" 
        value={totalAgreements} 
        icon="📋"
        color="bg-blue-100 text-blue-800"
      />
      <StatCard 
        title="Total Student Mobility" 
        value={totalStudents} 
        icon="👨‍🎓"
        color="bg-purple-100 text-purple-800"
      />
      <StatCard 
        title="Total Staff Mobility" 
        value={totalStaff} 
        icon="👩‍🏫"
        color="bg-pink-100 text-pink-800"
      />
      <StatCard 
        title="Joint Research" 
        value={totalJointResearch} 
        icon="🔬"
        color="bg-teal-100 text-teal-800"
      />
      <StatCard 
        title="Joint Publications" 
        value={totalJointPublication} 
        icon="📄"
        color="bg-indigo-100 text-indigo-800"
      />
      <StatCard 
        title="Co-Teaching" 
        value={totalCoTeaching} 
        icon="👩‍🏫"
        color="bg-orange-100 text-orange-800"
      />
      <StatCard 
        title="Joint Supervision" 
        value={totalJointSupervision} 
        icon="👨‍⚖️"
        color="bg-amber-100 text-amber-800"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ChartCard 
        title="Mobility Data by Year"
        data={mobilityData}
        bars={[
          <Bar key="students" dataKey="students" fill="#8B5FBF" name="Students" radius={[4, 4, 0, 0]}/>,
          <Bar key="staff" dataKey="staff" fill="#FF9A8B" name="Staff" radius={[4, 4, 0, 0]}/>
        ]}
      />
      <ChartCard 
        title="Joint Research & Publication"
        data={jointData}
        bars={[
          <Bar key="joint_research" dataKey="joint_research" fill="#4E8098" name="Research" radius={[4, 4, 0, 0]}/>,
          <Bar key="joint_publication" dataKey="joint_publication" fill="#90C2E7" name="Publications" radius={[4, 4, 0, 0]}/>
        ]}
      />
    </div>

    <div className="grid grid-cols-1 gap-8">
      <ChartCard 
        title="Co-Teaching & Joint Supervision"
        data={coTeachingData}
        bars={[
          <Bar key="co_teaching" dataKey="co_teaching" fill="#D4A59A" name="Co-Teaching" radius={[4, 4, 0, 0]}/>,
          <Bar key="joint_supervision" dataKey="joint_supervision" fill="#7D5A5A" name="Supervision" radius={[4, 4, 0, 0]}/>
        ]}
      />
    </div>
  </>
)}

          {/* Mobility View */}
          {selectedFilter === 'mobility' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                  title="Total Student Mobility" 
                  value={totalStudents} 
                  icon="👨‍🎓"
                  color="bg-purple-100 text-purple-800"
                />
                <StatCard 
                  title="Total Staff Mobility" 
                  value={totalStaff} 
                  icon="👩‍🏫"
                  color="bg-pink-100 text-pink-800"
                />
              </div>
              <ChartCard 
                title="Mobility Data by Year"
                data={mobilityData}
                bars={[
                  <Bar key="students" dataKey="students" fill="#8B5FBF" name="Students" radius={[4, 4, 0, 0]}/>,
                  <Bar key="staff" dataKey="staff" fill="#FF9A8B" name="Staff" radius={[4, 4, 0, 0]}/>
                ]}
              />
            </div>
          )}

          {/* Joint Research View */}
          {selectedFilter === 'joint' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                  title="Joint Research" 
                  value={totalJointResearch} 
                  icon="🔬"
                  color="bg-teal-100 text-teal-800"
                />
                <StatCard 
                  title="Joint Publications" 
                  value={totalJointPublication} 
                  icon="📄"
                  color="bg-blue-100 text-blue-800"
                />
              </div>
              <ChartCard 
                title="Joint Research & Publication"
                data={jointData}
                bars={[
                  <Bar key="joint_research" dataKey="joint_research" fill="#4E8098" name="Research" radius={[4, 4, 0, 0]}/>,
                  <Bar key="joint_publication" dataKey="joint_publication" fill="#90C2E7" name="Publications" radius={[4, 4, 0, 0]}/>
                ]}
              />
            </div>
          )}

          {/* Co-Teaching View */}
          {selectedFilter === 'coTeaching' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                  title="Co-Teaching" 
                  value={totalCoTeaching} 
                  icon="👩‍🏫"
                  color="bg-orange-100 text-orange-800"
                />
                <StatCard 
                  title="Joint Supervision" 
                  value={totalJointSupervision} 
                  icon="👨‍⚖️"
                  color="bg-amber-100 text-amber-800"
                />
              </div>
              <ChartCard 
                title="Co-Teaching & Joint Supervision"
                data={coTeachingData}
                bars={[
                  <Bar key="co_teaching" dataKey="co_teaching" fill="#D4A59A" name="Co-Teaching" radius={[4, 4, 0, 0]}/>,
                  <Bar key="joint_supervision" dataKey="joint_supervision" fill="#7D5A5A" name="Supervision" radius={[4, 4, 0, 0]}/>
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, icon, color }) {
  return (
    <div className={`p-6 rounded-xl shadow-sm ${color} flex items-center`}>
      <div className="text-3xl mr-4">{icon}</div>
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

// Reusable Chart Card Component
function ChartCard({ title, data, bars }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-[#1F2163] mb-4">{title}</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #eee',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            {bars}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
