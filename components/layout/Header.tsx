'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { BookOpen, GraduationCap, LayoutDashboard, LogOut, Menu, ShieldAlert, User as UserIcon, X } from 'lucide-react';

interface UserSession {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
}

export default function Header() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Session fetch failed', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const isLearningView = pathname.includes('/learn');
  if (isLearningView) return null; // Clean workspace for learn views

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-white">
            <GraduationCap className="h-8 w-8 text-violet-500 animate-pulse" />
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Edu<span className="text-violet-500">Sphere</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/courses" 
              className={`text-sm font-medium transition-colors hover:text-white ${pathname === '/courses' ? 'text-white' : 'text-slate-400'}`}
            >
              Browse Catalog
            </Link>
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-slate-800" />
          ) : user ? (
            <div className="flex items-center gap-4">
              {user.role === 'admin' ? (
                <Link 
                  href="/admin" 
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-500 hover:text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-full bg-amber-950/20"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Admin Suite
                </Link>
              ) : null}
              <Link 
                href="/dashboard" 
                className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <div className="h-5 w-px bg-slate-800" />
              <div className="flex items-center gap-3">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                  alt={user.name} 
                  className="h-8 w-8 rounded-full border border-violet-500 bg-slate-800"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white max-w-[120px] truncate">{user.name}</span>
                  <span className="text-xs text-slate-500 capitalize">{user.role}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-rose-400 transition"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-500 transition-all hover:scale-105 active:scale-95"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-slate-950 px-4 py-4 space-y-4">
          <Link 
            href="/courses" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-300 hover:text-white"
          >
            Browse Catalog
          </Link>
          
          {user ? (
            <div className="space-y-3 pt-3 border-t border-slate-900">
              <div className="flex items-center gap-3">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                  alt={user.name} 
                  className="h-10 w-10 rounded-full border border-violet-500 bg-slate-800"
                />
                <div>
                  <h4 className="text-sm font-medium text-white">{user.name}</h4>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <Link 
                href="/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white"
              >
                <LayoutDashboard className="h-4 w-4" />
                Student Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link 
                  href="/admin" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium text-amber-500 hover:text-amber-400"
                >
                  <ShieldAlert className="h-4 w-4" />
                  Admin Suite
                </Link>
              )}
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-2 text-sm font-medium text-rose-400 hover:text-rose-300"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-900">
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-center rounded-lg border border-slate-800 py-2 text-sm font-medium text-slate-300 hover:text-white"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-center rounded-lg bg-violet-600 py-2 text-sm font-semibold text-white"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
