'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, PlayCircle, Eye, Clock, X } from 'lucide-react';
import { parseYoutubeId } from '@/lib/utils';

interface Lesson {
  _id: any;
  title: string;
  description?: string;
  youtubeUrl: string;
  duration: number;
  isPreview: boolean;
  order: number;
}

interface Module {
  _id: any;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CourseSyllabusProps {
  modules: Module[];
}

export default function CourseSyllabus({ modules }: CourseSyllabusProps) {
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({
    '0': true // Pre-open first module for previewing syllabus
  });
  
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);

  const toggleModule = (index: number) => {
    setOpenModules(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handlePreview = (youtubeUrl: string) => {
    const videoId = parseYoutubeId(youtubeUrl);
    if (videoId) {
      setActivePreviewUrl(videoId);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-6">Course Curriculum</h3>
      
      {modules.length === 0 ? (
        <p className="text-slate-500 text-sm">Syllabus is being compiled by the instructor team.</p>
      ) : (
        <div className="space-y-3">
          {modules.map((mod, modIdx) => {
            const isOpen = !!openModules[modIdx];
            const totalDuration = mod.lessons.reduce((acc, curr) => acc + curr.duration, 0);

            return (
              <div 
                key={modIdx} 
                className="rounded-xl border border-white/5 bg-slate-900/10 overflow-hidden backdrop-blur-sm"
              >
                {/* Module Header Accordion Trigger */}
                <button
                  onClick={() => toggleModule(modIdx)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-900/20 transition"
                >
                  <div className="space-y-1 pr-4">
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                      Module {modIdx + 1}
                    </span>
                    <h4 className="text-base font-bold text-white leading-snug">{mod.title}</h4>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold shrink-0">
                    <span>{mod.lessons.length} classes</span>
                    <span>&bull;</span>
                    <span>{totalDuration}m</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </button>

                {/* Module Lessons list */}
                {isOpen && (
                  <div className="border-t border-slate-900 bg-slate-950/20 divide-y divide-slate-900/50">
                    {mod.lessons.length === 0 ? (
                      <p className="p-4 text-xs text-slate-650 italic">No modules loaded inside this course section.</p>
                    ) : (
                      mod.lessons.map((les, lesIdx) => (
                        <div 
                          key={lesIdx} 
                          className="flex items-center justify-between p-4 pl-6 text-sm hover:bg-slate-950/40 transition"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-600 font-mono w-5">
                              {(lesIdx + 1).toString().padStart(2, '0')}
                            </span>
                            <div className="space-y-0.5">
                              <span className="font-medium text-slate-300">{les.title}</span>
                              {les.description && (
                                <p className="text-slate-500 text-xs line-clamp-1">{les.description}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {les.duration}m
                            </span>
                            {les.isPreview ? (
                              <button
                                onClick={() => handlePreview(les.youtubeUrl)}
                                className="flex items-center gap-1 text-[11px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 hover:text-violet-300 px-2 py-1 rounded transition"
                              >
                                <Eye className="h-3 w-3" /> Preview
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Preview video modal overlay */}
      {activePreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl">
            <button
              onClick={() => setActivePreviewUrl(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-slate-950/80 p-2 text-slate-400 hover:text-white border border-white/5 transition"
            >
              <X className="h-5 w-5" />
            </button>
            <iframe 
              src={`https://www.youtube.com/embed/${activePreviewUrl}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
