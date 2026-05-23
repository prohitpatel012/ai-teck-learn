import { redirect, notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { Course } from '@/models/Course';
import { Enrollment } from '@/models/Enrollment';
import { Progress } from '@/models/Progress';
import { getUserFromRequest } from '@/lib/auth';
import LearningWorkspace from '@/components/learning/LearningWorkspace';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export default async function LearnPage({ params }: PageProps) {
  await connectToDatabase();
  
  // 1. Authenticate user session
  const session = await getUserFromRequest();
  if (!session) {
    redirect('/login');
  }

  // 2. Fetch Course
  const { slug } = await params;
  const course = await Course.findOne({ slug, published: true }).lean();
  
  if (!course) {
    notFound();
  }

  // 3. Confirm student enrollment
  const enrollment = await Enrollment.findOne({ 
    userId: session.userId, 
    courseId: course._id 
  });

  if (!enrollment) {
    // If not enrolled, redirect back to course overview
    redirect(`/courses/${slug}`);
  }

  // 4. Fetch or initialize progress
  let progressRecord = await Progress.findOne({ 
    userId: session.userId, 
    courseId: course._id 
  }).lean();

  if (!progressRecord) {
    const firstLessonId = course.modules?.[0]?.lessons?.[0]?._id?.toString() || '';
    
    // Fallback creation
    const newProgress = await Progress.create({
      userId: session.userId,
      courseId: course._id,
      completedLessons: [],
      currentLesson: firstLessonId,
      percentage: 0,
    });
    progressRecord = JSON.parse(JSON.stringify(newProgress));
  }

  // Sanitize objects to prevent React serialization errors
  const serializedCourse = JSON.parse(JSON.stringify(course));
  const serializedProgress = JSON.parse(JSON.stringify(progressRecord));

  return (
    <LearningWorkspace 
      course={serializedCourse} 
      initialProgress={serializedProgress} 
    />
  );
}
