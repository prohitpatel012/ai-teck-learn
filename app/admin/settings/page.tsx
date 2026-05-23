import { redirect } from 'next/navigation';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { ShieldCheck } from 'lucide-react';
import SettingsEditor from '@/components/admin/SettingsEditor';
import { SiteSettings } from '@/models/SiteSettings';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  await connectToDatabase();
  const session = await getUserFromRequest();

  // Guard the page
  if (!session || session.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch settings from DB (or use defaults)
  let dbSettings = await SiteSettings.findOne().lean();
  
  const serializedSettings = {
    activeStudentsOverride: dbSettings?.activeStudentsOverride || '15,000+',
    activeStudentsRealTime: dbSettings?.activeStudentsRealTime ?? false,
    coursesOfferedOverride: dbSettings?.coursesOfferedOverride || '45+',
    coursesOfferedRealTime: dbSettings?.coursesOfferedRealTime ?? false,
    successRate: dbSettings?.successRate || '98.4%',
    hoursTaught: dbSettings?.hoursTaught || '120k+',
  };

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
              Administrative Settings
            </h1>
            <p className="text-slate-400 text-sm">
              Manage application variables, metadata, landing page statistics overrides, and control features.
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
          <Link href="/admin/users" className="pb-3 hover:text-slate-350 transition">
            Student Roster
          </Link>
          <Link href="/admin/settings" className="pb-3 border-b-2 border-amber-500 text-white font-bold">
            Site Settings
          </Link>
        </div>

        <SettingsEditor initialSettings={serializedSettings} />

      </div>
    </div>
  );
}
