import mongoose, { Schema } from 'mongoose';

const lessonSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  youtubeUrl: { type: String, required: true },
  duration: { type: Number, required: true }, // In minutes
  isPreview: { type: Boolean, default: false },
  order: { type: Number, required: true }
});

const moduleSchema = new Schema({
  title: { type: String, required: true },
  order: { type: Number, required: true },
  lessons: [lessonSchema]
});

const courseSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  category: { type: String, required: true, index: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  instructor: {
    name: { type: String, required: true },
    bio: { type: String },
    avatar: { type: String }
  },
  modules: [moduleSchema],
  published: { type: Boolean, default: false, index: true },
  totalDuration: { type: Number, default: 0 }, // Auto-calculated sum of lesson durations
  totalLessons: { type: Number, default: 0 }    // Auto-calculated count of lessons
}, {
  timestamps: true
});

// Hooks to automatically update totalDuration and totalLessons on save
courseSchema.pre('save', function() {
  let count = 0;
  let duration = 0;
  
  if (this.modules) {
    this.modules.forEach((m: any) => {
      if (m.lessons) {
        count += m.lessons.length;
        m.lessons.forEach((l: any) => {
          duration += l.duration || 0;
        });
      }
    });
  }
  
  this.totalLessons = count;
  this.totalDuration = duration;
});

export const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
export const Module = mongoose.models.Module || mongoose.model('Module', moduleSchema);
export const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);
