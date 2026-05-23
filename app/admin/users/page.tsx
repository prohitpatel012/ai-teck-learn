import Link from 'next/link';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Enrollment } from '@/models/Enrollment';
import { Progress } from '@/models/Progress';
import { Course } from '@/models/Course';
import { getUserFromRequest } from '@/lib/auth';
import { ShieldCheck, BookOpen, Clock, Activity, Award } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  await connectToDatabase();
  const session = await getUserFromRequest();

  // Guard the page
  if (!session || session.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch all students (non-admins)
  const students = await User.find({ role: 'user' }).sort({ createdAt: -1 }).lean();

  // Fetch all enrollments
  const enrollments = await Enrollment.find().lean();
  
  // Fetch progress details
  const progressRecords = await Progress.find().lean();

  // Fetch all course catalog details for titles
  const courses = await Course.find().lean();

  // Construct full student learning profiles
  const studentProfiles = students.map(student => {
    const studentEnrollments = enrollments.filter(e => e.userId.toString() === student._id.toString());
    
    const details = studentEnrollments.map(e => {
      const course = courses.find(c => c._id.toString() === e.courseId.toString());
      const progress = progressRecords.find(p => p.userId.toString() === student._id.toString() && p.courseId.toString() === e.courseId.toString());
      
      return {
        courseTitle: course ? course.title : 'Deleted Course',
        percentage: progress ? progress.percentage : 0,
        completedCount: progress ? progress.completedLessons.length : 0,
        totalLessons: course ? course.totalLessons : 0,
      };
    });

    return {
      _id: student._id.toString(),
      name: student.name,
      email: student.email,
      avatar: student.avatar,
      createdAt: student.createdAt,
      enrollments: details,
    };
  });

  return (
    <div className="relative min-h-screen bg-slate-950 pb-20 pt-8">
      {/* Background radial spotlight */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 relative">
        
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-amber-500" />
              Student Roster Directory
            </h1>
            <p className="text-slate-400 text-sm">
              Monitor student engagement, track individual milestone percentages, and audit syllabus registrations.
            </p>
          </div>
        </div>

        {/* Administrative Sub-Navbar */}
        <div className="flex border-b border-white/5 gap-6 text-sm font-semibold text-slate-500">
          <Link href="/admin" className="pb-3 hover:text-slate-350 transition">
            Overview
          </Link>
          <Link href="/admin/courses" className="pb-3 hover:text-slate-350 transition">
            Course Management
          </Link>
          <Link href="/admin/users" className="pb-3 border-b-2 border-amber-500 text-white font-bold">
            Student Roster
          </Link>
          <Link href="/admin/settings" className="pb-3 hover:text-slate-350 transition">
            Site Settings
          </Link>
        </div>

        {/* Student listing section */}
        <div className="space-y-4">
          {studentProfiles.length === 0 ? (
            <div className="border border-white/5 bg-slate-900/10 rounded-2xl p-12 text-center text-slate-500 italic">
              No students registered in the ecosystem yet.
            </div>
          ) : (
            studentProfiles.map((student) => (
              <div 
                key={student._id} 
                className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm space-y-4 hover:border-amber-500/20 transition"
              >
                {/* Student header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900/80 pb-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} 
                      alt={student.name}
                      className="h-12 w-12 rounded-full border border-slate-800 bg-slate-950"
                    />
                    <div>
                      <h4 className="text-base font-bold text-white leading-snug">{student.name}</h4>
                      <p className="text-xs text-slate-550">{student.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4 text-amber-550" /> {student.enrollments.length} active courses
                    </span>
                    <span>&bull;</span>
                    <span>Joined: {new Date(student.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Sub-list of course enrollments and progress */}
                {student.enrollments.length === 0 ? (
                  <p className="text-xs text-slate-650 italic">This student is not enrolled in any technical syllabus.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {student.enrollments.map((e, idx) => (
                      <div key={idx} className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="text-xs font-bold text-white line-clamp-1 leading-snug">{e.courseTitle}</h5>
                          {e.percentage === 100 && (
                            <span className="flex items-center gap-0.5 text-[8px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                              <Award className="h-3 w-3" /> Graduate
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                            <span>{e.percentage}% Complete</span>
                            <span>{e.completedCount} / {e.totalLessons} Lectures</span>
                          </div>
                          <div className="w-full bg-slate-900 border border-white/5 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-amber-500 h-full rounded-full transition-all"
                              style={{ width: `${e.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
