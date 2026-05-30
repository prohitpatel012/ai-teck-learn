'use client';

import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on specific course overview and learning workspace pages
  if (pathname?.startsWith('/courses/')) {
    return null;
  }
  return (
    <footer className="border-t border-white/10 bg-slate-950 py-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand block */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-white">
              <GraduationCap className="h-6 w-6 text-violet-500" />
              <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                EduSphere
              </span>
            </Link>
            <p className="text-sm text-slate-500">
              Enterprise-grade training ecosystem for technical skills, web systems engineering, and creative computing.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Catalog</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/courses" className="hover:text-white transition">All Courses</Link></li>
              <li><Link href="/courses?category=Development" className="hover:text-white transition">Development</Link></li>
              <li><Link href="/courses?category=Design" className="hover:text-white transition">Design & Creative</Link></li>
              <li><Link href="/courses?category=Database" className="hover:text-white transition">Architecture</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Enterprise</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Business Tier</a></li>
              <li><a href="#" className="hover:text-white transition">Custom Training</a></li>
              <li><a href="#" className="hover:text-white transition">System Security</a></li>
              <li><a href="#" className="hover:text-white transition">LMS Cloud</a></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition">System Status</a></li>
              <li><a href="#" className="hover:text-white transition">API Docs</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <span>&copy; {new Date().getFullYear()} EduSphere Technologies Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
