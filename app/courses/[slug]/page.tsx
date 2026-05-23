import { notFound } from 'next/navigation';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/db';
import { Course } from '@/models/Course';
import { Enrollment } from '@/models/Enrollment';
import { getUserFromRequest } from '@/lib/auth';
import { BookOpen, Clock, ChevronRight, Play, Shield, Award, Users } from 'lucide-react';
import CourseSyllabus from '@/components/courses/CourseSyllabus';
import EnrollButton from '@/components/courses/EnrollButton';
import { formatDuration } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export default async function CourseDetailPage({ params }: PageProps) {
  await connectToDatabase();
  
  const { slug } = await params;
  const course = await Course.findOne({ slug, published: true }).lean();

  if (!course) {
    notFound();
  }

  // Check enrollment
  const session = await getUserFromRequest();
  let isEnrolled = false;
  if (session) {
    const enrollment = await Enrollment.findOne({ 
      userId: session.userId, 
      courseId: course._id 
    });
    isEnrolled = !!enrollment;
  }

  // Cast subdocuments properly for our props
  const serializedModules = JSON.parse(JSON.stringify(course.modules || []));

  return (
    <div className="relative min-h-screen bg-slate-950 pb-20 pt-8">
      {/* Dynamic top gradient backdrop */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-violet-600/10 via-slate-950/0 to-slate-950 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 relative">
        {/* Breadcrumb navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-slate-350">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/courses" className="hover:text-slate-350">Courses</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-400 truncate max-w-[200px]">{course.title}</span>
        </nav>

        {/* Core Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Columns (Syllabus & Info) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              {/* Category & Level Chips */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                  {course.category}
                </span>
                <span className="bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                  {course.level}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
                {course.title}
              </h1>

              {/* Description */}
              <p className="text-slate-400 text-base leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Course details card list */}
            <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-6 text-center sm:text-left">
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</span>
                <span className="text-lg font-bold text-white mt-1 block">
                  {formatDuration(course.totalDuration)}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Lectures</span>
                <span className="text-lg font-bold text-white mt-1 block">
                  {course.totalLessons} videos
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Resource Support</span>
                <span className="text-lg font-bold text-white mt-1 block">Lifetime</span>
              </div>
            </div>

            {/* Curriculum syllabus accordion */}
            <div className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm">
              <CourseSyllabus modules={serializedModules} />
            </div>

            {/* Instructor summary */}
            <div className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm space-y-4">
              <h3 className="text-xl font-bold text-white">Your Instructor</h3>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <img 
                  src={course.instructor?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Instructor'} 
                  alt={course.instructor?.name}
                  className="h-16 w-16 rounded-2xl bg-slate-950 border border-slate-800 shrink-0 object-cover"
                />
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-white">{course.instructor?.name}</h4>
                  <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider">Expert Technical Instructor</p>
                  <p className="text-slate-400 text-sm leading-relaxed pt-2">
                    {course.instructor?.bio || 'Experienced technical architect focused on modern front-end frameworks, responsive layouts, and scalable back-end databases.'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Pricing & Quick actions panel */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            <div className="border border-white/10 bg-slate-900/40 p-6 rounded-2xl backdrop-blur shadow-2xl space-y-6">
              
              {/* Thumbnail Container */}
              <div className="relative aspect-video rounded-xl bg-slate-950 border border-white/5 overflow-hidden">
                <img 
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'} 
                  alt={course.title}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Price Details */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block">MEMBERSHIP INCLUDED</span>
                <div className="flex items-baseline text-white">
                  <span className="text-3xl font-extrabold tracking-tight">$0</span>
                  <span className="ml-1 text-sm font-medium text-slate-500">with EduSphere Premium</span>
                </div>
              </div>

              {/* Core Features list */}
              <div className="space-y-3 pt-4 border-t border-slate-900 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-violet-500 shrink-0" />
                  <span>Full syllabus access in HD Focus Mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-violet-500 shrink-0" />
                  <span>Complete course completion tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-violet-500 shrink-0" />
                  <span>Verified shareable completion credentials</span>
                </div>
              </div>

              {/* Enroll button server/client handler */}
              <EnrollButton 
                courseId={course._id.toString()} 
                slug={course.slug} 
                isEnrolled={isEnrolled}
                isAuthenticated={!!session}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
