import Link from 'next/link';
import { ArrowRight, BookOpen, Clock, Cpu, GraduationCap, Layers, ShieldCheck, Sparkles, Trophy, Users } from 'lucide-react';
import { connectToDatabase } from '@/lib/db';
import { Course } from '@/models/Course';
import { User } from '@/models/User';
import { SiteSettings } from '@/models/SiteSettings';
import { formatDuration } from '@/lib/utils';

export default async function Home() {
  await connectToDatabase();
  
  // 1. Fetch site settings for stats overrides
  let dbSettings = await SiteSettings.findOne().lean();
  const settings = {
    activeStudentsOverride: dbSettings?.activeStudentsOverride || '15,000+',
    activeStudentsRealTime: dbSettings?.activeStudentsRealTime ?? false,
    coursesOfferedOverride: dbSettings?.coursesOfferedOverride || '45+',
    coursesOfferedRealTime: dbSettings?.coursesOfferedRealTime ?? false,
    successRate: dbSettings?.successRate || '98.4%',
    hoursTaught: dbSettings?.hoursTaught || '120k+',
  };

  // 2. Compute dynamic stats if toggled
  let activeStudentsValue = settings.activeStudentsOverride;
  if (settings.activeStudentsRealTime) {
    const activeUserCount = await User.countDocuments({ role: 'user' });
    activeStudentsValue = `${activeUserCount.toLocaleString()}+`;
  }

  let coursesOfferedValue = settings.coursesOfferedOverride;
  if (settings.coursesOfferedRealTime) {
    const publishedCourseCount = await Course.countDocuments({ published: true });
    coursesOfferedValue = `${publishedCourseCount}`;
  }

  const stats = [
    { label: 'Active Students', value: activeStudentsValue, icon: Users },
    { label: 'Courses Offered', value: coursesOfferedValue, icon: BookOpen },
    { label: 'Success Rate', value: settings.successRate, icon: Trophy },
    { label: 'Hours Taught', value: settings.hoursTaught, icon: Clock },
  ];

  const features = [
    {
      title: 'Dynamic Syllabus Builder',
      description: 'Create, rearrange, and modify complex course structures seamlessly using our admin suite visual curriculum model.',
      icon: Layers,
      color: 'text-sky-400 border-sky-400/20 bg-sky-950/20'
    },
    {
      title: 'Immersive Focus Mode',
      description: 'Block out distractions. Study with our custom YouTube integration, structured sidebar navigations, and real-time saved personal study notes.',
      icon: Cpu,
      color: 'text-violet-400 border-violet-400/20 bg-violet-950/20'
    },
    {
      title: 'Enterprise Analytics',
      description: 'Track aggregate registration spikes, enrollment frequencies, active lecture engagement, and student study milestones.',
      icon: ShieldCheck,
      color: 'text-emerald-400 border-emerald-400/20 bg-emerald-950/20'
    }
  ];

  // 3. Fetch top 2 published courses from DB
  const dbCourses = await Course.find({ published: true }).limit(2).lean();
  
  const highlightedCourses = dbCourses.length > 0
    ? dbCourses.map((c: any) => ({
        title: c.title,
        category: c.category,
        level: c.level,
        lessons: c.totalLessons,
        duration: formatDuration(c.totalDuration),
        desc: c.description,
        thumbnail: c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
        slug: c.slug
      }))
    : [
        {
          title: 'Mastering Next.js 16 & React 19',
          category: 'Development',
          level: 'Advanced',
          lessons: 14,
          duration: '4h 15m',
          desc: 'Master concurrent rendering, server components, and enterprise architectures with Next.js 16.',
          thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
          slug: 'mastering-nextjs-16'
        },
        {
          title: 'Advanced Tailwind CSS v4 & Creative Layouts',
          category: 'Design',
          level: 'Intermediate',
          lessons: 10,
          duration: '2h 40m',
          desc: 'Leverage Tailwind v4 utility enhancements, custom theme rules, and responsive glassmorphic cards.',
          thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop',
          slug: 'advanced-tailwind-v4'
        }
      ];

  return (
    <div className="relative overflow-hidden bg-slate-950 text-slate-100 flex flex-col items-center">
      {/* Decorative background blobs */}
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-sky-600/10 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8 text-center sm:text-left grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1.5 text-xs font-semibold text-violet-300">
            <Sparkles className="h-3.5 w-3.5 animate-spin" />
            Empowering the Next Generation of Engineers
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white leading-tight">
            Enterprise Skills,
            <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-sky-400 bg-clip-text text-transparent">
              Learned in Focus.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl">
            A state-of-the-art training ecosystem engineered to elevate professional development. Experience distraction-free learning, rich curriculum architecture, and real-time student analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start pt-2">
            <Link 
              href="/courses" 
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-500 hover:shadow-violet-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Explore Catalog
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900/50 px-6 py-3.5 text-base font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Hero Interactive visual element */}
        <div className="relative group mx-auto lg:mx-0 max-w-lg lg:max-w-none w-full aspect-video rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-sky-500/10 opacity-50 group-hover:opacity-80 transition-opacity" />
          <div className="relative h-full w-full rounded-lg bg-slate-950/80 border border-white/5 flex flex-col justify-between p-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500" />
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs text-slate-600 font-mono">learn.edusphere.io</span>
            </div>
            
            <div className="flex-1 py-6 flex flex-col justify-center gap-2">
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-wide">Focus Learning Space</span>
              <h3 className="text-xl font-bold text-white">Interactive Engineering Course</h3>
              <p className="text-sm text-slate-500">Currently playing: Module 3: Advanced Reactive Rendering Patterns</p>
              
              {/* Fake progress bar */}
              <div className="w-full bg-slate-850 h-2 rounded-full mt-4 overflow-hidden border border-white/5">
                <div className="bg-gradient-to-r from-violet-500 to-sky-500 h-full rounded-full w-[72%] animate-pulse" />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>72% Completed</span>
                <span>12 / 16 Lessons</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 border-t border-white/5 pt-4">
              <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4 text-violet-500" /> EduSphere Premium</span>
              <span className="rounded bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-300">STUDENT ACTIVE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full border-y border-white/5 bg-slate-900/30 backdrop-blur-sm py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center text-center space-y-2">
                <div className="rounded-lg bg-violet-600/10 border border-violet-500/10 p-2.5">
                  <stat.icon className="h-6 w-6 text-violet-400" />
                </div>
                <span className="text-3xl font-bold text-white tracking-tight">{stat.value}</span>
                <span className="text-sm text-slate-500 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white sm:text-4xl tracking-tight"> Engineered for Premium Training </h2>
          <p className="text-slate-400">
            Say goodbye to clunky, uninspiring learning portals. EduSphere brings state-of-the-art components to optimize knowledge retention.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col items-start text-left p-6 rounded-2xl border border-white/5 bg-slate-900/20 backdrop-blur hover:border-violet-500/20 transition-all hover:scale-[1.01] hover:bg-slate-900/40">
              <div className={`rounded-xl border p-3 mb-5 ${feature.color}`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="w-full bg-slate-900/20 py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-3xl font-bold text-white tracking-tight">Explore Featured Courses</h2>
              <p className="text-slate-400">Accelerate your skills with direct paths from beginner to master.</p>
            </div>
            <Link 
              href="/courses" 
              className="inline-flex items-center gap-1 text-sm font-semibold text-violet-400 hover:text-violet-300 transition"
            >
              View all courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {highlightedCourses.map((course, i) => (
              <div key={i} className="flex flex-col sm:flex-row rounded-2xl border border-white/5 bg-slate-950 overflow-hidden group hover:border-violet-500/30 transition-all">
                {/* Thumbnail */}
                <div className="relative sm:w-2/5 aspect-[4/3] sm:aspect-auto overflow-hidden bg-slate-900">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-violet-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    {course.category}
                  </div>
                </div>
                {/* Body */}
                <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>{course.level}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {course.duration}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white leading-snug group-hover:text-violet-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                      {course.desc}
                    </p>
                  </div>
                  
                  <Link 
                    href={`/courses/${course.slug}`}
                    className="inline-flex w-full justify-center items-center rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 py-2.5 transition"
                  >
                    View Curriculum
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white tracking-tight">Flexible, Transparent Pricing</h2>
          <p className="text-slate-400">Unlock your true potential today. Zero hidden fees. Cancel anytime.</p>
        </div>

        <div className="mx-auto max-w-md rounded-3xl border border-violet-500 bg-slate-900/40 p-8 backdrop-blur shadow-xl relative">
          <div className="absolute top-0 right-8 -translate-y-1/2 bg-violet-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-full shadow">
            MOST POPULAR
          </div>
          <div className="space-y-4 text-left">
            <h3 className="text-xl font-bold text-white">Full-Access Membership</h3>
            <p className="text-sm text-slate-400">Unlock all current courses, visual syllabus builders, and interactive note-taking portals.</p>
            <div className="flex items-baseline text-white">
              <span className="text-5xl font-extrabold tracking-tight">$29</span>
              <span className="ml-1 text-xl font-semibold text-slate-500">/month</span>
            </div>
            
            <ul className="space-y-3 pt-6 border-t border-slate-800 text-sm text-slate-300">
              <li className="flex items-center gap-2"><ShieldCheck className="h-4.5 w-4.5 text-violet-500" /> Complete Catalog Access</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4.5 w-4.5 text-violet-500" /> Focus Mode & Embedded Player</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4.5 w-4.5 text-violet-500" /> Save Unlimited Personal Notes</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4.5 w-4.5 text-violet-500" /> Course Progress Tracking</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4.5 w-4.5 text-violet-500" /> Verified Course Certificates</li>
            </ul>

            <Link 
              href="/register" 
              className="inline-flex w-full justify-center items-center rounded-lg bg-violet-600 text-sm font-semibold text-white hover:bg-violet-500 py-3.5 transition-all shadow-lg shadow-violet-500/25 mt-8"
            >
              Get Started Instantly
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
