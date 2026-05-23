import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { Progress } from '@/models/Progress';
import { Course } from '@/models/Course';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    // 1. Authenticate user
    const session = await getUserFromRequest();
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { userId } = session;
    const body = await request.json();
    const { courseId, lessonId, completed, updateCheckpointOnly } = body;

    if (!courseId || !lessonId) {
      return NextResponse.json({ message: 'Missing courseId or lessonId' }, { status: 400 });
    }

    // 2. Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    // 3. Find or create progress document
    let progress = await Progress.findOne({ userId, courseId });
    
    if (!progress) {
      progress = new Progress({
        userId,
        courseId,
        completedLessons: [],
        percentage: 0,
      });
    }

    // Update active checkpoint
    progress.currentLesson = lessonId;
    progress.lastWatched = new Date();

    if (!updateCheckpointOnly) {
      // Add or remove lesson from finished list
      const completedSet = new Set(progress.completedLessons);
      
      if (completed) {
        completedSet.add(lessonId);
      } else {
        completedSet.delete(lessonId);
      }
      
      progress.completedLessons = Array.from(completedSet);

      // Recalculate percentage progress
      let totalLessons = 0;
      course.modules.forEach((m: any) => {
        totalLessons += m.lessons.length;
      });

      if (totalLessons > 0) {
        progress.percentage = Math.min(
          100,
          Math.round((progress.completedLessons.length / totalLessons) * 100)
        );
      } else {
        progress.percentage = 0;
      }
    }

    await progress.save();

    return NextResponse.json({ 
      message: 'Progress synchronized', 
      progress 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Progress API Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
