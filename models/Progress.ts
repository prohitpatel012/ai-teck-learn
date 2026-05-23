import mongoose, { Schema } from 'mongoose';

const progressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  completedLessons: [{ type: String }], // Array of Lesson IDs (stringified ObjectIds)
  currentLesson: { type: String },     // Currently active/last watched Lesson ID
  percentage: { type: Number, default: 0 },
  lastWatched: { type: Date, default: Date.now }
}, {
  timestamps: true
});

progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Progress = mongoose.models.Progress || mongoose.model('Progress', progressSchema);
