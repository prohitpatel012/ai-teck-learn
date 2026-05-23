import Link from 'next/link';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Course } from '@/models/Course';
import { Enrollment } from '@/models/Enrollment';
import { getUserFromRequest } from '@/lib/auth';
import { ShieldCheck, Users, BookOpen, Layers, PlusCircle, UserPlus, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await connectToDatabase();
  const session = await getUserFromRequest();
  
  // Guard the page
  if (!session || session.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch KPI details
  const totalUsers = await User.countDocuments({ role: 'user' });
  const totalAdmins = await User.countDocuments({ role: 'admin' });
  const totalCourses = await Course.countDocuments();
  const publishedCourses = await Course.countDocuments({ published: true });
  const totalEnrollments = await Enrollment.countDocuments();

  // Fetch recent student registrations
  const recentStudents = await User.find({ role: 'user' })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Fetch recent courses created
  const recentCourses = await Course.find()
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  return (
    <div className="relative min-h-screen bg-slate-950 pb-20 pt-8">
      {/* Background gradients */}
      <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 relative">
        
        {/* Page Title & Dashboard Navigation Tabs */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-amber-500" />
              Administrative Command Center
            </h1>
            <p className="text-slate-400 text-sm">
              Manage course curriculum architectures, register student metrics, and observe enrollment activity.
            </p>
          </div>
          <Link 
            href="/admin/courses/new" 
            className="rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-semibold text-slate-950 transition flex items-center gap-1.5 shadow-lg shadow-amber-500/10"
          >
            <PlusCircle className="h-4 w-4" /> Create Course
          </Link>
        </div>

        {/* Administrative Sub-Navbar */}
        <div className="flex border-b border-white/5 gap-6 text-sm font-semibold text-slate-500">
          <Link href="/admin" className="pb-3 border-b-2 border-amber-500 text-white font-bold">
            Overview
          </Link>
          <Link href="/admin/courses" className="pb-3 hover:text-slate-350 transition">
            Course Management
          </Link>
          <Link href="/admin/users" className="pb-3 hover:text-slate-350 transition">
            Student Roster
          </Link>
          <Link href="/admin/settings" className="pb-3 hover:text-slate-350 transition">
            Site Settings
          </Link>
        </div>

        {/* Administrative KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-500 shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</span>
              <span className="text-2xl font-bold text-white mt-0.5 block">{totalUsers}</span>
            </div>
          </div>

          <div className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded-xl text-blue-500 shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Courses</span>
              <span className="text-2xl font-bold text-white mt-0.5 block">{totalCourses}</span>
            </div>
          </div>

          <div className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-500 shrink-0">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Published Paths</span>
              <span className="text-2xl font-bold text-white mt-0.5 block">{publishedCourses} / {totalCourses}</span>
            </div>
          </div>

          <div className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 border border-purple-500/25 rounded-xl text-purple-400 shrink-0">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Registrations</span>
              <span className="text-2xl font-bold text-white mt-0.5 block">{totalEnrollments}</span>
            </div>
          </div>
        </div>

        {/* Admin overview dashboard layout lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Registrations list */}
          <div className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" /> Recent Student Signups
            </h3>

            {recentStudents.length === 0 ? (
              <p className="text-slate-650 text-xs italic">No registered users in the database.</p>
            ) : (
              <div className="space-y-4">
                {recentStudents.map((student: any, i) => (
                  <div key={student._id} className="flex items-center justify-between border-b border-slate-900 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <img 
                        src={student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} 
                        alt={student.name}
                        className="h-9 w-9 rounded-full bg-slate-950 border border-slate-800"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{student.name}</h4>
                        <p className="text-[10px] text-slate-500">{student.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-550 font-medium">
                      Registered: {new Date(student.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Courses list */}
          <div className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" /> Recent Courses Added
            </h3>

            {recentCourses.length === 0 ? (
              <p className="text-slate-650 text-xs italic">No courses in database. Click "Create Course" above.</p>
            ) : (
              <div className="space-y-4">
                {recentCourses.map((course: any) => (
                  <div key={course._id} className="flex items-center justify-between border-b border-slate-900 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-16 bg-slate-900 border border-white/5 rounded overflow-hidden shrink-0">
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">{course.title}</h4>
                        <p className="text-[10px] text-slate-500">{course.category} &bull; {course.level}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        course.published 
                          ? 'bg-emerald-550/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}>
                        {course.published ? 'Published' : 'Draft'}
                      </span>
                      <Link 
                        href={`/admin/courses/${course._id}/edit`}
                        className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
