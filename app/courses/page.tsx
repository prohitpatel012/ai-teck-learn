import Link from 'next/link';
import { connectToDatabase } from '@/lib/db';
import { Course } from '@/models/Course';
import { BookOpen, Clock, Filter, GraduationCap, Search, SlidersHorizontal } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    level?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function CoursesPage({ searchParams }: PageProps) {
  await connectToDatabase();
  
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || '';
  const category = resolvedParams.category || 'All';
  const level = resolvedParams.level || 'All';

  // Build Mongo Query
  const mongoQuery: any = { published: true };
  
  if (search) {
    mongoQuery.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (category !== 'All') {
    mongoQuery.category = category;
  }
  
  if (level !== 'All') {
    mongoQuery.level = level;
  }

  // Fetch from DB
  const courses = await Course.find(mongoQuery).lean();
  
  // Get all unique categories for dynamic filter pills
  const categoriesList = await Course.distinct('category', { published: true });
  const allCategories = ['All', ...categoriesList];

  const levelsList = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="relative min-h-screen bg-slate-950 pb-20 pt-10">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10 relative">
        {/* Title */}
        <div className="space-y-4 max-w-xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Syllabus Catalog
          </h1>
          <p className="text-slate-400 text-base">
            Explore advanced technical modules curated for system engineers, product UI artists, and enterprise programmers.
          </p>
        </div>

        {/* Filters and search section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Interactive sidebar filters */}
          <div className="space-y-6 lg:col-span-1 border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm h-fit">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="font-semibold text-white flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-violet-500" />
                Refine Search
              </span>
              <Link href="/courses" className="text-xs text-slate-500 hover:text-slate-300">
                Clear all
              </Link>
            </div>

            {/* Text search form */}
            <form method="GET" action="/courses" className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Keyword</label>
              <div className="relative">
                <input 
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="e.g. Next.js"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-violet-500 focus:outline-none"
                />
                <Search className="absolute top-3 left-3.5 h-4 w-4 text-slate-600" />
              </div>
              {category !== 'All' && <input type="hidden" name="category" value={category} />}
              {level !== 'All' && <input type="hidden" name="level" value={level} />}
            </form>

            {/* Category selection */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Category</span>
              <div className="flex flex-wrap lg:flex-col gap-2">
                {allCategories.map((cat, i) => {
                  const queryObj: any = {};
                  if (search) queryObj.search = search;
                  if (level !== 'All') queryObj.level = level;
                  queryObj.category = cat;
                  
                  const active = category === cat;

                  return (
                    <Link
                      key={i}
                      href={{ pathname: '/courses', query: queryObj }}
                      className={`text-sm px-3 py-1.5 rounded-lg border text-left transition font-medium ${
                        active 
                          ? 'bg-violet-600 border-violet-500 text-white shadow shadow-violet-600/20' 
                          : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-white'
                      }`}
                    >
                      {cat}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Level selection */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Difficulty</span>
              <div className="flex flex-wrap lg:flex-col gap-2">
                {levelsList.map((lvl, i) => {
                  const queryObj: any = {};
                  if (search) queryObj.search = search;
                  if (category !== 'All') queryObj.category = category;
                  queryObj.level = lvl;

                  const active = level === lvl;

                  return (
                    <Link
                      key={i}
                      href={{ pathname: '/courses', query: queryObj }}
                      className={`text-sm px-3 py-1.5 rounded-lg border text-left transition font-medium ${
                        active 
                          ? 'bg-violet-600 border-violet-500 text-white shadow shadow-violet-600/20' 
                          : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Listing grids */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
              <span>Showing {courses.length} courses</span>
              { (search || category !== 'All' || level !== 'All') && (
                <span className="text-violet-400">Filters active</span>
              )}
            </div>

            {courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-slate-850 rounded-2xl bg-slate-900/10 min-h-[300px] space-y-4">
                <div className="p-3 bg-slate-900 rounded-full text-slate-600">
                  <Filter className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-white">No courses match your query</h3>
                <p className="text-slate-500 text-sm max-w-xs">
                  Try clearing your search filters, adjusting difficulty parameters, or searching for other keywords.
                </p>
                <Link href="/courses" className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition">
                  Reset Catalog Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course: any, i) => (
                  <div key={i} className="flex flex-col rounded-2xl border border-white/5 bg-slate-900/20 backdrop-blur-sm overflow-hidden group hover:border-violet-500/25 transition-all hover:translate-y-[-2px]">
                    <div className="relative aspect-video bg-slate-800 overflow-hidden">
                      <img 
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'} 
                        alt={course.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-violet-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
                        {course.category}
                      </span>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                          <span className="rounded-full bg-slate-950 border border-white/5 px-2.5 py-0.5 text-slate-400">
                            {course.level}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formatDuration(course.totalDuration)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white leading-snug group-hover:text-violet-400 transition-colors line-clamp-1">
                          {course.title}
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                          {course.description}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-900">
                        <div className="flex items-center gap-2">
                          <img 
                            src={course.instructor?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Instructor'} 
                            alt={course.instructor?.name}
                            className="h-6 w-6 rounded-full bg-slate-950 border border-slate-800"
                          />
                          <span className="text-xs text-slate-450 font-medium">{course.instructor?.name}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-semibold">{course.totalLessons} lessons</span>
                      </div>

                      <Link 
                        href={`/courses/${course.slug}`}
                        className="inline-flex w-full justify-center items-center rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white py-2.5 transition shadow-lg shadow-violet-500/10"
                      >
                        Explore Syllabus
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
