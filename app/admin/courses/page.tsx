import Link from 'next/link';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { Course } from '@/models/Course';
import { getUserFromRequest } from '@/lib/auth';
import { ShieldCheck, PlusCircle, Edit, ExternalLink, BookOpen, Clock, FileText } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage() {
  await connectToDatabase();
  const session = await getUserFromRequest();

  // Guard the page
  if (!session || session.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch all courses
  const courses = await Course.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="relative min-h-screen bg-slate-950 pb-20 pt-8">
      {/* Background radial spotlight */}
      <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 relative">
        
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-amber-500" />
              Course Catalog Management
            </h1>
            <p className="text-slate-400 text-sm">
              Add new courses, configure modules, add lessons, specify YouTube video parameters, and publish content.
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
          <Link href="/admin" className="pb-3 hover:text-slate-350 transition">
            Overview
          </Link>
          <Link href="/admin/courses" className="pb-3 border-b-2 border-amber-500 text-white font-bold">
            Course Management
          </Link>
          <Link href="/admin/users" className="pb-3 hover:text-slate-350 transition">
            Student Roster
          </Link>
          <Link href="/admin/settings" className="pb-3 hover:text-slate-350 transition">
            Site Settings
          </Link>
        </div>

        {/* Courses Table Listing */}
        <div className="border border-white/5 bg-slate-900/10 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 space-y-4 min-h-[300px]">
              <div className="p-3 bg-slate-900 rounded-full text-slate-650">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-base font-semibold text-white">No courses created</h3>
              <p className="text-slate-500 text-xs max-w-xs">
                You have not created any courses in your training ecosystem. Add your first course now!
              </p>
              <Link href="/admin/courses/new" className="rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 text-xs font-semibold transition">
                Create First Course
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-900 bg-slate-950/40 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="p-4 pl-6">Course Detail</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Level</th>
                    <th className="p-4">Lectures</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/50">
                  {courses.map((course: any) => (
                    <tr key={course._id} className="hover:bg-slate-900/10 transition">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-16 bg-slate-900 border border-white/5 rounded overflow-hidden shrink-0">
                            <img 
                              src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'} 
                              alt={course.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-white max-w-[200px] truncate">{course.title}</h4>
                            <p className="text-[10px] text-slate-550 truncate max-w-[200px]">{course.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300 font-medium">{course.category}</td>
                      <td className="p-4">
                        <span className="text-[10px] font-semibold text-slate-450 rounded bg-slate-900 border border-white/5 px-2 py-0.5">
                          {course.level}
                        </span>
                      </td>
                      <td className="p-4 text-slate-350 font-semibold">{course.totalLessons} videos</td>
                      <td className="p-4 text-slate-350 font-semibold">{formatDuration(course.totalDuration)}</td>
                      <td className="p-4">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          course.published 
                            ? 'bg-emerald-550/10 border-emerald-500/20 text-emerald-400 font-semibold' 
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}>
                          {course.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-3">
                        <Link 
                          href={`/courses/${course.slug}`}
                          target="_blank"
                          className="inline-flex text-slate-500 hover:text-white transition"
                          title="Preview details"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <Link 
                          href={`/admin/courses/${course._id}/edit`}
                          className="inline-flex text-amber-500 hover:text-amber-400 font-semibold transition"
                          title="Edit course"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
