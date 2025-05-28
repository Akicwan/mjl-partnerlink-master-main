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

  if (!userEmail || loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <Sidebar role="admin" email={userEmail}>
      <div className="p-6 bg-white rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-[#1F2163] mb-4">Admin Dashboard</h1>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          {['all', 'mobility', 'joint', 'coTeaching'].map((key) => (
            <button
              key={key}
              className={`px-4 py-2 rounded-full text-white font-semibold ${
                selectedFilter === key ? 'bg-[#1F2163]' : 'bg-gray-400'
              }`}
              onClick={() => setSelectedFilter(key)}
            >
              {{
                all: 'All Activities',
                mobility: 'Mobility Data by Year',
                joint: 'Joint Research Publication by Year',
                coTeaching: 'Co-Teaching and Joint Supervision by Year'
              }[key]}
            </button>
          ))}
        </div>

        {/* Graphs and Summary */}
        {selectedFilter === 'all' && (
          <div className="flex flex-col gap-6 items-center" >
          
            <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
              {renderChart("Mobility Data by Year", mobilityData, [
                <Bar key="students" dataKey="students" fill="#C599B6" name="Students" radius={[8, 8, 0, 0]} barSize={70}/>,
                <Bar key="staff" dataKey="staff" fill="#FAD0C4" name="Staff" radius={[8, 8, 0, 0]} barSize={70}/>
              ])}
               {renderChart("Joint Research & Publication by Year", jointData, [
              <Bar key="joint_research" dataKey="joint_research" fill="#89A8B2" name="Joint Research" radius={[8, 8, 0, 0]} barSize={70}/>,
              <Bar key="joint_publication" dataKey="joint_publication" fill="#F1F0E8" name="Joint Publication" radius={[8, 8, 0, 0]} barSize={70}/>
            ])}
            </div>
            <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
              {renderChart("Co-Teaching & Joint Supervision by Year", coTeachingData, [
                <Bar key="co_teaching" dataKey="co_teaching" fill="#D29F80" name="Co-Teaching" radius={[8, 8, 0, 0]} barSize={70}/>,
                <Bar key="joint_supervision" dataKey="joint_supervision" fill="#735557" name="Joint Supervision" radius={[8, 8, 0, 0]} barSize={70}/>
              ])}
            </div>
          </div>
        )}

        {selectedFilter === 'mobility' && (
          <div className="items-center">
            {renderChart("Mobility Data by Year", mobilityData, [
              <Bar key="students" dataKey="students" fill="#C599B6" name="Students" radius={[8, 8, 0, 0]} barSize={70} />,
              <Bar key="staff" dataKey="staff" fill="#FAD0C4" name="Staff" radius={[8, 8, 0, 0]} barSize={70}/>
            ])}
            {mobilityCards}
          </div>
        )}

        {selectedFilter === 'joint' && (
          <>
            {renderChart("Joint Research & Publication by Year", jointData, [
              <Bar key="joint_research" dataKey="joint_research" fill="#89A8B2" name="Joint Research" radius={[8, 8, 0, 0]} barSize={70}/>,
              <Bar key="joint_publication" dataKey="joint_publication" fill="#F1F0E8" name="Joint Publication" radius={[8, 8, 0, 0]} barSize={70}/>
            ])}
            {jointCards}
          </>
        )}

        {selectedFilter === 'coTeaching' && (
          <>
            {renderChart("Co-Teaching & Joint Supervision by Year", coTeachingData, [
              <Bar key="co_teaching" dataKey="co_teaching" fill="#D29F80" name="Co-Teaching" radius={[8, 8, 0, 0]} barSize={70}/>,
              <Bar key="joint_supervision" dataKey="joint_supervision" fill="#735557" name="Joint Supervision" radius={[8, 8, 0, 0]} barSize={70}/>
            ])}
            {coteachingsuperCards}
          </>
        )}
      </div>
    </Sidebar>
  );
}
