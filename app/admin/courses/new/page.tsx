import { redirect } from 'next/navigation';
import { getUserFromRequest } from '@/lib/auth';
import CourseEditor from '@/components/admin/CourseEditor';

export const dynamic = 'force-dynamic';

export default async function NewCoursePage() {
  const session = await getUserFromRequest();
  
  // Guard the route
  if (!session || session.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20 pt-8">
      <CourseEditor />
    </div>
  );
}
