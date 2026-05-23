'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSiteSettings } from '@/actions/settings';
import { Save, Loader2, Sparkles, AlertCircle, Settings } from 'lucide-react';

interface SettingsEditorProps {
  initialSettings: {
    activeStudentsOverride: string;
    activeStudentsRealTime: boolean;
    coursesOfferedOverride: string;
    coursesOfferedRealTime: boolean;
    successRate: string;
    hoursTaught: string;
  };
}

export default function SettingsEditor({ initialSettings }: SettingsEditorProps) {
  const router = useRouter();
  const [activeStudentsOverride, setActiveStudentsOverride] = useState(initialSettings.activeStudentsOverride);
  const [activeStudentsRealTime, setActiveStudentsRealTime] = useState(initialSettings.activeStudentsRealTime);
  const [coursesOfferedOverride, setCoursesOfferedOverride] = useState(initialSettings.coursesOfferedOverride);
  const [coursesOfferedRealTime, setCoursesOfferedRealTime] = useState(initialSettings.coursesOfferedRealTime);
  const [successRate, setSuccessRate] = useState(initialSettings.successRate);
  const [hoursTaught, setHoursTaught] = useState(initialSettings.hoursTaught);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    const payload = {
      activeStudentsOverride,
      activeStudentsRealTime,
      coursesOfferedOverride,
      coursesOfferedRealTime,
      successRate,
      hoursTaught,
    };

    try {
      const res = await updateSiteSettings(payload);
      if (res.success) {
        setSuccess(res.message);
        router.refresh();
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      console.error(err);
      setError('Connection failed. Please retry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Save action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-amber-500" />
            Landing Page Configurations
          </h2>
          <p className="text-slate-400 text-xs">
            Toggle real-time database counts or customize override values for marketing/promotional display.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-amber-950 font-bold text-slate-950 text-xs px-4 py-2.5 transition shadow-lg shadow-amber-500/10 cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving settings...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Settings
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-950/20 border border-rose-500/15 p-3.5 text-xs font-medium text-rose-400">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/20 border border-emerald-500/15 p-3.5 text-xs font-medium text-emerald-400">
          <Sparkles className="h-4.5 w-4.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Students Card */}
        <div className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Students</h3>
            <div className="flex items-center gap-1.5">
              <input 
                type="checkbox"
                id="activeStudentsRealTime"
                checked={activeStudentsRealTime}
                onChange={(e) => setActiveStudentsRealTime(e.target.checked)}
                className="rounded border-slate-800 text-amber-500 bg-slate-950 focus:ring-amber-500 h-4 w-4 cursor-pointer"
              />
              <label htmlFor="activeStudentsRealTime" className="text-[10px] font-bold text-slate-450 uppercase tracking-widest cursor-pointer select-none">
                Real-Time DB Count
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Custom Override Text</label>
            <input 
              type="text"
              required
              disabled={activeStudentsRealTime}
              value={activeStudentsOverride}
              onChange={(e) => setActiveStudentsOverride(e.target.value)}
              placeholder="e.g. 15,000+"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-505">
              {activeStudentsRealTime 
                ? "Currently displaying actual registered student count from database dynamically." 
                : "Displaying this static text value on the landing page."
              }
            </p>
          </div>
        </div>

        {/* Courses Offered Card */}
        <div className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Courses Offered</h3>
            <div className="flex items-center gap-1.5">
              <input 
                type="checkbox"
                id="coursesOfferedRealTime"
                checked={coursesOfferedRealTime}
                onChange={(e) => setCoursesOfferedRealTime(e.target.checked)}
                className="rounded border-slate-800 text-amber-500 bg-slate-950 focus:ring-amber-500 h-4 w-4 cursor-pointer"
              />
              <label htmlFor="coursesOfferedRealTime" className="text-[10px] font-bold text-slate-450 uppercase tracking-widest cursor-pointer select-none">
                Real-Time DB Count
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Custom Override Text</label>
            <input 
              type="text"
              required
              disabled={coursesOfferedRealTime}
              value={coursesOfferedOverride}
              onChange={(e) => setCoursesOfferedOverride(e.target.value)}
              placeholder="e.g. 45+"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-505">
              {coursesOfferedRealTime 
                ? "Currently displaying actual published course count from database dynamically." 
                : "Displaying this static text value on the landing page."
              }
            </p>
          </div>
        </div>

        {/* Success Rate Card */}
        <div className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2">Success Rate</h3>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Display Value</label>
            <input 
              type="text"
              required
              value={successRate}
              onChange={(e) => setSuccessRate(e.target.value)}
              placeholder="e.g. 98.4%"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-505">This static metric card displays custom success statistics.</p>
          </div>
        </div>

        {/* Hours Taught Card */}
        <div className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2">Hours Taught</h3>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Display Value</label>
            <input 
              type="text"
              required
              value={hoursTaught}
              onChange={(e) => setHoursTaught(e.target.value)}
              placeholder="e.g. 120k+"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-505">This static metric card displays custom learning hours statistics.</p>
          </div>
        </div>
      </div>
    </form>
  );
}
