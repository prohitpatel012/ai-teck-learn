import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }]
}, {
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
