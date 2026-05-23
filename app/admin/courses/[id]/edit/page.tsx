import { notFound, redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { Course } from '@/models/Course';
import { getUserFromRequest } from '@/lib/auth';
import CourseEditor from '@/components/admin/CourseEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function EditCoursePage({ params }: PageProps) {
  await connectToDatabase();
  const session = await getUserFromRequest();

  // Guard the route
  if (!session || session.role !== 'admin') {
    redirect('/dashboard');
  }

  const { id } = await params;
  const course = await Course.findById(id).lean();

  if (!course) {
    notFound();
  }

  // Serialize Mongoose document to prevent React server context errors
  const serializedCourse = JSON.parse(JSON.stringify(course));

  return (
    <div className="min-h-screen bg-slate-950 pb-20 pt-8">
      <CourseEditor initialCourse={serializedCourse} />
    </div>
  );
}
