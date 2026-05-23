import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { Progress } from '../models/Progress';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lms-enterprise';

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  // 1. Wipe collections
  console.log('Cleaning existing records...');
  await User.deleteMany({});
  await Course.deleteMany({});
  await Enrollment.deleteMany({});
  await Progress.deleteMany({});
  console.log('Database wiped cleanly.');

  // 2. Hash default password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 3. Create preloaded users
  console.log('Seeding student and admin profiles...');
  const student = await User.create({
    name: 'Sarah Connor',
    email: 'student@lms.com',
    password: hashedPassword,
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah',
    enrolledCourses: []
  });

  const admin = await User.create({
    name: 'Miles Dyson',
    email: 'admin@lms.com',
    password: hashedPassword,
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Miles',
    enrolledCourses: []
  });

  console.log('Profiles generated.');

  // 4. Create premium software courses
  console.log('Seeding technical course catalog...');

  const course1 = new Course({
    title: 'Mastering Next.js 16 & React 19',
    slug: 'mastering-nextjs-16',
    description: 'Dive deep into modern concurrent rendering, async React Server Components, server-side data mutations via actions, stream borders, and enterprise folder scaling.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
    category: 'Development',
    level: 'Advanced',
    published: true,
    instructor: {
      name: 'Dr. Evelyn Sterling',
      bio: 'Former principal tech lead at Vercel with 12+ years lecturing on reactive web states, edge middleware caching, and multi-tier architectures.',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Evelyn'
    },
    modules: [
      {
        title: ' Renders and Data Strata',
        order: 1,
        lessons: [
          {
            title: 'Welcome to React Server Components (RSC)',
            description: 'Understand client-server boundary paradigms, static hydration processes, and parallel loading threads.',
            youtubeUrl: 'https://www.youtube.com/watch?v=ZVnjOPwW4ZA', // High-quality React tutorial
            duration: 12,
            isPreview: true,
            order: 1
          },
          {
            title: 'Streaming Boundaries and Suspense Fallbacks',
            description: 'Learn to segment heavy database reads, implement visual skeleton loaders, and stream content dynamically.',
            youtubeUrl: 'https://www.youtube.com/watch?v=d5x0JCZbAJs',
            duration: 18,
            isPreview: false,
            order: 2
          }
        ]
      },
      {
        title: ' Server Actions & Mutations',
        order: 2,
        lessons: [
          {
            title: 'Frictionless Forms with Server Actions',
            description: 'Perform POST mutations securely directly in action files with zero REST boilerplate and automatic Zod triggers.',
            youtubeUrl: 'https://www.youtube.com/watch?v=R6RgpYkOtK0',
            duration: 15,
            isPreview: true,
            order: 1
          },
          {
            title: 'Optimistic UI Updates on the Edge',
            description: 'Leverage useOptimistic to update client screens immediately while Mongoose inserts complete in background.',
            youtubeUrl: 'https://www.youtube.com/watch?v=35g3G-RphC4',
            duration: 20,
            isPreview: false,
            order: 2
          }
        ]
      }
    ]
  });

  const course2 = new Course({
    title: 'Advanced Tailwind CSS v4 & Creative Layouts',
    slug: 'advanced-tailwind-v4',
    description: 'Harness custom CSS imports, v4 utility core engine rewrites, CSS variables themes overrides, responsive grid cards, and complex glassmorphic components.',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop',
    category: 'Design',
    level: 'Intermediate',
    published: true,
    instructor: {
      name: 'Marcus Vance',
      bio: 'SaaS product designer specializing in creative UI architectures, micro-interactions, responsive CSS systems, and fluid container transitions.',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Marcus'
    },
    modules: [
      {
        title: ' Tailwind v4 CSS Integration',
        order: 1,
        lessons: [
          {
            title: 'Setup & Theme Configurations with @import',
            description: 'Integrate the new PostCSS v4 utility engine, configure root @theme overrides, and leverage system dark flags.',
            youtubeUrl: 'https://www.youtube.com/watch?v=R6RgpYkOtK0',
            duration: 14,
            isPreview: true,
            order: 1
          },
          {
            title: 'Responsive Glassmorphic SaaS Cards',
            description: 'Build futuristic cards blending backdrop-filter, border-white/10, custom shadow gradients, and active scale animations.',
            youtubeUrl: 'https://www.youtube.com/watch?v=ZVnjOPwW4ZA',
            duration: 16,
            isPreview: false,
            order: 2
          }
        ]
      }
    ]
  });

  const course3 = new Course({
    title: 'Full-Stack Node.js Enterprise Architecture',
    slug: 'node-enterprise-architecture',
    description: 'Learn multithreaded background processing, custom event loop diagnostics, horizontal database clustering, and security token policies.',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
    category: 'Database',
    level: 'Advanced',
    published: false, // Draft state to test admin filtering!
    instructor: {
      name: 'Dr. Evelyn Sterling',
      bio: 'Former principal tech lead at Vercel with 12+ years lecturing on reactive web states, edge middleware caching, and multi-tier architectures.',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Evelyn'
    },
    modules: [
      {
        title: ' Multithreading and Performance',
        order: 1,
        lessons: [
          {
            title: 'Worker Threads and Heavy Mathematical Calculations',
            description: 'Distribute complex cryptographic hashing loads outside of standard single-threaded main Node structures.',
            youtubeUrl: 'https://www.youtube.com/watch?v=d5x0JCZbAJs',
            duration: 22,
            isPreview: false,
            order: 1
          }
        ]
      }
    ]
  });

  // Save Courses. The pre-save hooks will automatically compute totalDuration and totalLessons.
  await course1.save();
  await course2.save();
  await course3.save();

  console.log('Courses created successfully.');

  // 5. Automatically Enroll student in Next.js course to populate dashboard
  console.log('Pre-registering Sarah Connor into Next.js course...');
  await Enrollment.create({
    userId: student._id,
    courseId: course1._id
  });

  // Add course to user enrolled list
  student.enrolledCourses.push(course1._id);
  await student.save();

  // Create active Progress for student
  await Progress.create({
    userId: student._id,
    courseId: course1._id,
    completedLessons: [course1.modules[0].lessons[0]._id.toString()], // Sarah completed the first lesson!
    currentLesson: course1.modules[0].lessons[1]._id.toString(), // active checkpoint is lesson 2
    percentage: 50, // 1/2 lessons in module 1 completed
  });

  console.log(' Sarah registered successfully.');
  console.log('Seeding finished successfully! Safe to close script.');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding critical failure:', err);
  process.exit(1);
});
