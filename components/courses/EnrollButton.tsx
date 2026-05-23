'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { enrollInCourse } from '@/actions/enroll';
import { ArrowRight, BookOpen, Loader2, Sparkles } from 'lucide-react';

interface EnrollButtonProps {
  courseId: string;
  slug: string;
  isEnrolled: boolean;
  isAuthenticated: boolean;
}

export default function EnrollButton({ courseId, slug, isEnrolled, isAuthenticated }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAction = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${slug}`);
      return;
    }

    if (isEnrolled) {
      router.push(`/courses/${slug}/learn`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await enrollInCourse(courseId);
      if (res.success) {
        router.push(`/courses/${slug}/learn`);
        router.refresh();
      } else {
        setError(res.message);
      }
    } catch (err) {
      console.error(err);
      setError('Enrollment request failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleAction}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-850 px-6 py-4 font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-violet-600/10 cursor-pointer disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Provisioning Seats...
          </>
        ) : isEnrolled ? (
          <>
            Resume Course
            <ArrowRight className="h-5 w-5" />
          </>
        ) : !isAuthenticated ? (
          <>
            Join Class
            <ArrowRight className="h-5 w-5" />
          </>
        ) : (
          <>
            Enroll in Syllabus
            <Sparkles className="h-5 w-5" />
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-rose-400 text-center font-medium bg-rose-950/20 border border-rose-500/15 p-2.5 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
}
