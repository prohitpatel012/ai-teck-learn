import { z } from 'zod';

export const zodLessonSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional().default(''),
  youtubeUrl: z.string().optional().default(''),
  duration: z.coerce.number().optional().default(0),
  isPreview: z.boolean().default(false),
  order: z.number().default(0),
});

export const zodModuleSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  order: z.number().default(0),
  lessons: z.array(zodLessonSchema).default([]),
});

export const zodCourseSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  thumbnail: z.string().optional().default(''),
  category: z.string().min(2, 'Category is required'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
  instructor: z.object({
    name: z.string().min(2, 'Instructor name must be at least 2 characters'),
    bio: z.string().optional().default(''),
    avatar: z.string().optional().default(''),
  }),
  modules: z.array(zodModuleSchema).default([]),
  published: z.boolean().default(false),
});

export type LessonInput = z.infer<typeof zodLessonSchema>;
export type ModuleInput = z.infer<typeof zodModuleSchema>;
export type CourseInput = z.infer<typeof zodCourseSchema>;
