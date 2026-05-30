'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, CheckCircle, Circle, ArrowLeft, PlayCircle, BookOpenCheck, Edit3, Info, ChevronRight, CheckSquare, Square, Menu } from 'lucide-react';
import { parseYoutubeId, formatDuration } from '@/lib/utils';

interface Lesson {
  _id: string;
  title: string;
  description?: string;
  youtubeUrl: string;
  duration: number;
  isPreview: boolean;
  order: number;
}

interface Module {
  _id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  _id: string;
  title: string;
  slug: string;
  modules: Module[];
}

interface Progress {
  completedLessons: string[];
  currentLesson?: string;
  percentage: number;
}

interface LearningWorkspaceProps {
  course: Course;
  initialProgress: Progress;
}

export default function LearningWorkspace({ course, initialProgress }: LearningWorkspaceProps) {
  const router = useRouter();
  const [progress, setProgress] = useState<Progress>(initialProgress);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  
  // Tabs: 'curriculum' | 'notes' | 'about'
  const [activeTab, setActiveTab] = useState<'curriculum' | 'notes' | 'about'>('about');
  const [personalNotes, setPersonalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [syncingProgress, setSyncingProgress] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Flatten lessons for easy indexing/next navigation
  const allLessons: Lesson[] = [];
  course.modules.forEach(m => {
    m.lessons.forEach(l => {
      allLessons.push(l);
    });
  });

  // Determine active lesson on mount
  useEffect(() => {
    if (progress.currentLesson) {
      const found = allLessons.find(l => l._id.toString() === progress.currentLesson);
      if (found) {
        setActiveLesson(found);
      } else if (allLessons.length > 0) {
        setActiveLesson(allLessons[0]);
      }
    } else if (allLessons.length > 0) {
      setActiveLesson(allLessons[0]);
    }
  }, [progress.currentLesson]);

  // Load and auto-save personal notes from localStorage
  useEffect(() => {
    if (activeLesson) {
      const savedNote = localStorage.getItem(`note-${course._id}-${activeLesson._id}`) || '';
      setPersonalNotes(savedNote);
    }
  }, [activeLesson, course._id]);

  const handleNotesChange = (val: string) => {
    setPersonalNotes(val);
    if (activeLesson) {
      localStorage.setItem(`note-${course._id}-${activeLesson._id}`, val);
    }
  };

  const selectLesson = async (lesson: Lesson) => {
    setActiveLesson(lesson);
    // Auto-update current lesson checkpoint on backend
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course._id,
          lessonId: lesson._id,
          completed: progress.completedLessons.includes(lesson._id),
          updateCheckpointOnly: true
        })
      });
      
      setProgress(prev => ({
        ...prev,
        currentLesson: lesson._id
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLessonComplete = async (lessonId: string) => {
    if (syncingProgress) return;
    
    setSyncingProgress(true);
    const isCompleted = progress.completedLessons.includes(lessonId);
    
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course._id,
          lessonId,
          completed: !isCompleted
        })
      });

      if (res.ok) {
        const data = await res.json();
        setProgress(data.progress);
      }
    } catch (err) {
      console.error('Progress sync failed', err);
    } finally {
      setSyncingProgress(false);
    }
  };

  const handleNextLesson = () => {
    if (!activeLesson) return;
    const currIdx = allLessons.findIndex(l => l._id === activeLesson._id);
    if (currIdx !== -1 && currIdx < allLessons.length - 1) {
      selectLesson(allLessons[currIdx + 1]);
    }
  };

  const handlePrevLesson = () => {
    if (!activeLesson) return;
    const currIdx = allLessons.findIndex(l => l._id === activeLesson._id);
    if (currIdx > 0) {
      selectLesson(allLessons[currIdx - 1]);
    }
  };

  const activeVideoId = activeLesson ? parseYoutubeId(activeLesson.youtubeUrl) : null;
  const isFirstLesson = activeLesson ? allLessons.findIndex(l => l._id === activeLesson._id) === 0 : true;
  const isLastLesson = activeLesson ? allLessons.findIndex(l => l._id === activeLesson._id) === allLessons.length - 1 : true;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden text-slate-100">
      
      {/* Workspace Subheader */}
      <div className="flex h-14 border-b border-white/5 bg-slate-950 px-4 items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white border border-slate-900 bg-slate-900/40 px-2.5 py-1.5 rounded-lg transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <h2 className="text-sm font-bold text-white max-w-[200px] sm:max-w-md truncate hidden sm:block">
            {course.title}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress metric */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-violet-400">{progress.percentage}%</span>
            <span>Completed</span>
            <div className="w-16 sm:w-24 bg-slate-900 border border-white/5 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-violet-500 to-sky-500 h-full rounded-full transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white border border-slate-900 bg-slate-900/40 px-2.5 py-1.5 rounded-lg lg:hidden"
          >
            <Menu className="h-4 w-4" /> Curriculum
          </button>
        </div>
      </div>

      {/* Main split work space */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Column: Player and Tabs */}
        <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
          
          {/* Immersive player container */}
          <div className="w-full bg-black aspect-video relative flex items-center justify-center border-b border-white/5">
            {activeVideoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=0&rel=0&modestbranding=1`}
                title={activeLesson?.title || "Video Player"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full absolute inset-0"
              />
            ) : activeLesson?.youtubeUrl ? (
              <div className="flex flex-col items-center gap-2 text-slate-550">
                <PlayCircle className="h-12 w-12 animate-pulse text-violet-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">Loading video player...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400 p-8 text-center">
                <PlayCircle className="h-12 w-12 text-slate-650" />
                <h4 className="text-sm font-bold text-white">No video content yet</h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  This lesson does not have a video URL assigned yet. You can read the study notes below or proceed to the next lesson.
                </p>
              </div>
            )}
          </div>

          {/* Navigation and quick complete checks */}
          {activeLesson && (
            <div className="flex items-center justify-between p-4 bg-slate-950/80 border-b border-white/5">
              <div className="flex gap-2">
                <button
                  onClick={handlePrevLesson}
                  disabled={isFirstLesson}
                  className="rounded-lg border border-slate-900 hover:border-slate-800 disabled:opacity-40 bg-slate-900/20 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextLesson}
                  disabled={isLastLesson}
                  className="rounded-lg border border-slate-900 hover:border-slate-800 disabled:opacity-40 bg-slate-900/20 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>

              <button
                onClick={() => toggleLessonComplete(activeLesson._id)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                  progress.completedLessons.includes(activeLesson._id)
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25'
                    : 'bg-violet-600 border-violet-500 text-white hover:bg-violet-500 shadow-md shadow-violet-600/15'
                }`}
              >
                {progress.completedLessons.includes(activeLesson._id) ? (
                  <>
                    <CheckSquare className="h-4 w-4" /> Finished
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4" /> Complete Lesson
                  </>
                )}
              </button>
            </div>
          )}

          {/* Interaction tabs section */}
          <div className="flex-1 p-6 space-y-6 max-w-4xl mx-auto w-full">
            <div className="flex border-b border-white/5 gap-6 text-sm font-semibold">
              <button
                onClick={() => setActiveTab('about')}
                className={`pb-3 transition border-b-2 ${activeTab === 'about' ? 'border-violet-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-350'}`}
              >
                <span className="flex items-center gap-1.5"><Info className="h-4 w-4" /> About</span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-3 transition border-b-2 ${activeTab === 'notes' ? 'border-violet-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-350'}`}
              >
                <span className="flex items-center gap-1.5"><Edit3 className="h-4 w-4" /> Study Notes</span>
              </button>
            </div>

            {/* About Tab */}
            {activeTab === 'about' && activeLesson && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Active Lecture</span>
                  <h3 className="text-xl font-bold text-white">{activeLesson.title}</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {activeLesson.description || 'Welcome to this syllabus lecture. Take notes, follow coding modules, and complete checkpoints to advance.'}
                </p>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && activeLesson && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-white">Interactive Scratchpad</h4>
                    <p className="text-[10px] text-slate-550">Autosaves locally to your browser cache on each keystroke.</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded uppercase tracking-wider">
                    Synced
                  </span>
                </div>
                <textarea
                  value={personalNotes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Paste terminal scripts, key takeaways, code fragments, or outline requirements here..."
                  className="w-full min-h-[180px] rounded-xl border border-slate-800 bg-slate-900/10 p-4 text-sm text-slate-300 placeholder-slate-650 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono leading-relaxed"
                />
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Roadmap Sidebar (Desktop sticky / Mobile overlay) */}
        <div className={`lg:relative lg:flex lg:flex-col shrink-0 w-80 border-l border-white/5 bg-slate-950/80 backdrop-blur-sm z-30 transition-transform ${
          sidebarOpen ? 'translate-x-0 absolute lg:static right-0 inset-y-0 shadow-2xl lg:shadow-none' : 'translate-x-full absolute right-0 inset-y-0 lg:hidden'
        }`}>
          
          {/* Sidebar Header */}
          <div className="flex h-14 px-4 items-center justify-between border-b border-white/5 bg-slate-950">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <BookOpenCheck className="h-4.5 w-4.5 text-violet-500" /> Syllabus Roadmap
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-xs text-slate-550 hover:text-white"
            >
              Close
            </button>
          </div>

          {/* Module roadmap scroll list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-900/80">
            {course.modules.map((mod, modIdx) => (
              <div key={mod._id} className="p-4 space-y-3">
                <h4 className="text-xs font-bold text-white leading-tight line-clamp-1">
                  M{modIdx + 1}: {mod.title}
                </h4>
                
                <div className="space-y-1">
                  {mod.lessons.map((les) => {
                    const isActive = activeLesson?._id === les._id;
                    const isFinished = progress.completedLessons.includes(les._id);
                    
                    return (
                      <button
                        key={les._id}
                        onClick={() => selectLesson(les)}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition ${
                          isActive 
                            ? 'bg-violet-950/30 border border-violet-500/20 text-white' 
                            : 'border border-transparent text-slate-400 hover:bg-slate-900/30 hover:text-white'
                        }`}
                      >
                        {isFinished ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                        )}
                        
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <p className={`text-xs font-medium leading-tight truncate ${isActive ? 'text-violet-300' : ''}`}>
                            {les.title}
                          </p>
                          <span className="text-[10px] text-slate-550 block">{formatDuration(les.duration)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
