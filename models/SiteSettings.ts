import mongoose, { Schema } from 'mongoose';

const siteSettingsSchema = new Schema({
  activeStudentsOverride: { type: String, default: '15,000+' },
  activeStudentsRealTime: { type: Boolean, default: false },
  coursesOfferedOverride: { type: String, default: '45+' },
  coursesOfferedRealTime: { type: Boolean, default: false },
  successRate: { type: String, default: '98.4%' },
  hoursTaught: { type: String, default: '120k+' },
}, {
  timestamps: true
});

export const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);
