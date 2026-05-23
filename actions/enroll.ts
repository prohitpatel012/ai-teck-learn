'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { Enrollment } from '@/models/Enrollment';
import { User } from '@/models/User';
import { Course } from '@/models/Course';
import { Progress } from '@/models/Progress';

export async function enrollInCourse(courseId: string) {
  try {
    await connectToDatabase();
    const session = await getUserFromRequest();
    
    if (!session) {
      return { success: false, message: 'Please sign in to enroll' };
    }

    const { userId } = session;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return { success: false, message: 'Course not found' };
    }

    // Verify not already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) {
      return { success: true, message: 'Already enrolled' };
    }

    // Create enrollment
    await Enrollment.create({ userId, courseId });

    // Update User enrolledCourses array
    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId }
    });

    // Initialize Student Progress
    const firstLessonId = course.modules?.[0]?.lessons?.[0]?._id?.toString() || '';
    
    await Progress.create({
      userId,
      courseId,
      completedLessons: [],
      currentLesson: firstLessonId,
      percentage: 0,
    });

    revalidatePath(`/courses/${course.slug}`);
    revalidatePath('/dashboard');

    return { success: true, message: 'Enrolled successfully' };
  } catch (error: any) {
    console.error('Enrollment Action Error:', error);
    return { success: false, message: error.message || 'Internal server error' };
  }
}
