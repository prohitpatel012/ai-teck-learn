import Link from 'next/link';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { Enrollment } from '@/models/Enrollment';
import { Course } from '@/models/Course';
import { Progress } from '@/models/Progress';
import { getUserFromRequest } from '@/lib/auth';
import { BookOpen, Award, CheckCircle, Clock, BookOpenCheck, ArrowRight, Compass } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await connectToDatabase();
  const session = await getUserFromRequest();
  
  if (!session) {
    redirect('/login');
  }

  const { userId } = session;

  // 1. Get Enrollments
  const enrollments = await Enrollment.find({ userId }).lean();
  const courseIds = enrollments.map(e => e.courseId);

  // 2. Fetch Enrolled Courses
  const enrolledCourses = await Course.find({ _id: { $in: courseIds } }).lean();

  // 3. Fetch progress for these courses
  const progressRecords = await Progress.find({ userId, courseId: { $in: courseIds } }).lean();
  
  // Map progress to course items
  const coursesWithProgress = enrolledCourses.map(course => {
    const progress = progressRecords.find(p => p.courseId.toString() === course._id.toString());
    const percent = progress ? progress.percentage : 0;
    const completedCount = progress ? progress.completedLessons.length : 0;
    
    return {
      ...course,
      percentage: percent,
      completedLessonsCount: completedCount,
      lastWatched: progress ? progress.lastWatched : null,
    };
  });

  // Calculate Metrics
  const totalCourses = enrolledCourses.length;
  const completedCourses = coursesWithProgress.filter(c => c.percentage === 100).length;
  const totalLessonsFinished = coursesWithProgress.reduce((acc, curr) => acc + curr.completedLessonsCount, 0);
  
  // Get recommendations (published courses not enrolled in)
  const recommendations = await Course.find({ 
    published: true, 
    _id: { $nin: courseIds } 
  }).limit(2).lean();

  return (
    <div className="relative min-h-screen bg-slate-950 pb-20 pt-8">
      {/* Background radial spotlight */}
      <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10 relative">
        {/* Header summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Student Dashboard</h1>
            <p className="text-slate-400 text-sm">
              Welcome back, <span className="text-violet-400 font-semibold">{session.name}</span>. Continue your professional technical learning.
            </p>
          </div>
          <Link href="/courses" className="rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white transition flex items-center gap-1.5 shadow-lg shadow-violet-600/10">
            <Compass className="h-4 w-4" /> Browse Catalog
          </Link>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm flex items-center gap-4">
            <div className="p-3 bg-violet-500/10 border border-violet-500/25 rounded-xl text-violet-400 shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Courses Active</span>
              <span className="text-2xl font-bold text-white mt-0.5 block">{totalCourses}</span>
            </div>
          </div>

          <div className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 shrink-0">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Finished Syllabus</span>
              <span className="text-2xl font-bold text-white mt-0.5 block">{completedCourses}</span>
            </div>
          </div>

          <div className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm flex items-center gap-4">
            <div className="p-3 bg-sky-500/10 border border-sky-500/25 rounded-xl text-sky-400 shrink-0">
              <BookOpenCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Lectures Completed</span>
              <span className="text-2xl font-bold text-white mt-0.5 block">{totalLessonsFinished} classes</span>
            </div>
          </div>
        </div>

        {/* Dashboard contents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Enrolled courses block */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-white">Your Enrolled Courses</h3>

            {coursesWithProgress.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-slate-850 rounded-2xl bg-slate-900/10 min-h-[300px] space-y-4">
                <div className="p-3 bg-slate-900 rounded-full text-slate-650">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="text-base font-semibold text-white">No enrolled courses</h3>
                <p className="text-slate-500 text-xs max-w-xs">
                  You are not registered in any learning path. Explore our catalog and begin training now!
                </p>
                <Link href="/courses" className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition">
                  Browse Free Courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {coursesWithProgress.map((course, i) => (
                  <div key={i} className="flex flex-col sm:flex-row border border-white/5 bg-slate-900/15 backdrop-blur-sm rounded-2xl overflow-hidden hover:border-violet-500/20 transition-all p-5 gap-5">
                    {/* Course Thumbnail */}
                    <div className="relative w-full sm:w-1/4 aspect-video rounded-xl bg-slate-950 overflow-hidden border border-white/5 shrink-0 self-center">
                      <img 
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'} 
                        alt={course.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    {/* Course description body */}
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                          <span>{course.category}</span>
                          <span>{course.level}</span>
                        </div>
                        <h4 className="text-base font-bold text-white leading-snug">{course.title}</h4>
                      </div>

                      {/* Course progress block */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <span>{course.percentage}% Completed</span>
                          <span>{course.completedLessonsCount} / {course.totalLessons} Lessons</span>
                        </div>
                        <div className="w-full bg-slate-900 border border-white/5 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-violet-500 to-sky-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${course.percentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-900/40">
                        <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatDuration(course.totalDuration)} duration
                        </span>
                        <Link 
                          href={`/courses/${course.slug}/learn`}
                          className="rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white px-4 py-2 transition flex items-center gap-1"
                        >
                          Continue Learning
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Recommendations & stats */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm space-y-6">
              <h3 className="text-base font-bold text-white">Recommended Courses</h3>
              
              {recommendations.length === 0 ? (
                <p className="text-slate-650 text-xs italic">You have enrolled in all available courses!</p>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((course: any, i) => (
                    <div key={i} className="flex gap-3 group border-b border-slate-900 pb-4 last:border-0 last:pb-0">
                      <div className="relative h-12 w-20 rounded-lg overflow-hidden bg-slate-900 border border-white/5 shrink-0">
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="space-y-1 flex-1">
                        <h4 className="text-xs font-bold text-white group-hover:text-violet-400 transition-colors line-clamp-1">
                          <Link href={`/courses/${course.slug}`}>{course.title}</Link>
                        </h4>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                          <span>{course.level}</span>
                          <span>{course.totalLessons} classes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Premium Study support tip card */}
            <div className="border border-violet-500/10 bg-violet-950/5 p-6 rounded-2xl backdrop-blur-sm space-y-3">
              <div className="flex items-center gap-2 text-violet-400">
                <Award className="h-5 w-5" />
                <h4 className="text-sm font-bold text-white">Study Milestone Achieved</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unlock official credentials for each syllabus completed at 100%. Highlight your certifications directly on your LinkedIn profile!
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
