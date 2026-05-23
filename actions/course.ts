'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { Course } from '@/models/Course';
import { zodCourseSchema } from '@/validators/course';

export async function createCourse(payload: any) {
  try {
    await connectToDatabase();
    const session = await getUserFromRequest();
    
    // Guard
    if (!session || session.role !== 'admin') {
      return { success: false, message: 'Unauthorized. Admins only.' };
    }

    // Validate
    const validation = zodCourseSchema.safeParse(payload);
    if (!validation.success) {
      return { success: false, message: validation.error.issues[0].message };
    }

    // Check slug uniqueness
    const existing = await Course.findOne({ slug: validation.data.slug });
    if (existing) {
      return { success: false, message: 'Slug must be unique. This slug is already in use.' };
    }

    // Create course
    const newCourse = await Course.create(validation.data);

    revalidatePath('/admin/courses');
    revalidatePath('/courses');

    return { 
      success: true, 
      message: 'Course created successfully', 
      courseId: newCourse._id.toString() 
    };
  } catch (error: any) {
    console.error('Create Course Action Error:', error);
    return { success: false, message: error.message || 'Internal server error' };
  }
}

export async function updateCourse(id: string, payload: any) {
  try {
    await connectToDatabase();
    const session = await getUserFromRequest();
    
    // Guard
    if (!session || session.role !== 'admin') {
      return { success: false, message: 'Unauthorized. Admins only.' };
    }

    // Validate
    const validation = zodCourseSchema.safeParse(payload);
    if (!validation.success) {
      return { success: false, message: validation.error.issues[0].message };
    }

    // Check slug uniqueness against other courses
    const existing = await Course.findOne({ 
      slug: validation.data.slug, 
      _id: { $ne: id } 
    });
    if (existing) {
      return { success: false, message: 'Slug must be unique. This slug is already in use.' };
    }

    // Update course. Note that this triggers pre-save hook to recalculate lessons and durations!
    const course = await Course.findById(id);
    if (!course) {
      return { success: false, message: 'Course not found' };
    }

    // Assign new values
    Object.assign(course, validation.data);
    await course.save();

    revalidatePath('/admin/courses');
    revalidatePath(`/courses/${course.slug}`);
    revalidatePath('/courses');
    revalidatePath('/dashboard');

    return { 
      success: true, 
      message: 'Course updated successfully', 
      courseId: course._id.toString() 
    };
  } catch (error: any) {
    console.error('Update Course Action Error:', error);
    return { success: false, message: error.message || 'Internal server error' };
  }
}
