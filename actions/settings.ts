'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { SiteSettings } from '@/models/SiteSettings';

export async function updateSiteSettings(payload: {
  activeStudentsOverride: string;
  activeStudentsRealTime: boolean;
  coursesOfferedOverride: string;
  coursesOfferedRealTime: boolean;
  successRate: string;
  hoursTaught: string;
}) {
  try {
    await connectToDatabase();
    const session = await getUserFromRequest();
    
    // Guard
    if (!session || session.role !== 'admin') {
      return { success: false, message: 'Unauthorized. Admins only.' };
    }

    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings(payload);
    } else {
      Object.assign(settings, payload);
    }
    
    await settings.save();

    revalidatePath('/');
    revalidatePath('/admin/settings');

    return { 
      success: true, 
      message: 'Site settings updated successfully'
    };
  } catch (error: any) {
    console.error('Update Settings Action Error:', error);
    return { success: false, message: error.message || 'Internal server error' };
  }
}
