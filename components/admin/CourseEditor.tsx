'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCourse, updateCourse } from '@/actions/course';
import { Save, PlusCircle, Trash, ArrowLeft, Loader2, Sparkles, AlertCircle, FileEdit, Plus, Trash2 } from 'lucide-react';

interface Lesson {
  title: string;
  description?: string;
  youtubeUrl: string;
  duration: number;
  isPreview: boolean;
  order: number;
}

interface Module {
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Instructor {
  name: string;
  bio: string;
  avatar: string;
}

interface CourseEditorProps {
  initialCourse?: {
    _id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail: string;
    category: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    published: boolean;
    instructor: Instructor;
    modules: Module[];
  };
}

export default function CourseEditor({ initialCourse }: CourseEditorProps) {
  const router = useRouter();
  const isEditing = !!initialCourse;

  // Form states
  const [title, setTitle] = useState(initialCourse?.title || '');
  const [slug, setSlug] = useState(initialCourse?.slug || '');
  const [description, setDescription] = useState(initialCourse?.description || '');
  const [thumbnail, setThumbnail] = useState(initialCourse?.thumbnail || '');
  const [category, setCategory] = useState(initialCourse?.category || 'Development');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(initialCourse?.level || 'Beginner');
  const [published, setPublished] = useState(initialCourse?.published || false);
  
  // Instructor state
  const [instructor, setInstructor] = useState<Instructor>({
    name: initialCourse?.instructor?.name || '',
    bio: initialCourse?.instructor?.bio || '',
    avatar: initialCourse?.instructor?.avatar || '',
  });

  // Modules state
  const [modules, setModules] = useState<Module[]>(
    initialCourse?.modules || [
      { title: 'Getting Started', order: 0, lessons: [] }
    ]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto-generate slug from title
  const generateSlug = () => {
    const computed = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(computed);
  };

  // Module management
  const addModule = () => {
    setModules(prev => [
      ...prev,
      { title: `Module ${prev.length + 1}`, order: prev.length, lessons: [] }
    ]);
  };

  const removeModule = (modIdx: number) => {
    setModules(prev => prev.filter((_, idx) => idx !== modIdx));
  };

  const updateModuleTitle = (modIdx: number, val: string) => {
    setModules(prev => prev.map((m, idx) => idx === modIdx ? { ...m, title: val } : m));
  };

  // Lesson management
  const addLesson = (modIdx: number) => {
    setModules(prev => prev.map((m, idx) => {
      if (idx !== modIdx) return m;
      return {
        ...m,
        lessons: [
          ...m.lessons,
          {
            title: `Lesson ${m.lessons.length + 1}`,
            description: '',
            youtubeUrl: '',
            duration: 10,
            isPreview: false,
            order: m.lessons.length
          }
        ]
      };
    }));
  };

  const removeLesson = (modIdx: number, lesIdx: number) => {
    setModules(prev => prev.map((m, idx) => {
      if (idx !== modIdx) return m;
      return {
        ...m,
        lessons: m.lessons.filter((_, lIdx) => lIdx !== lesIdx)
      };
    }));
  };

  const updateLessonField = (modIdx: number, lesIdx: number, field: keyof Lesson, val: any) => {
    setModules(prev => prev.map((m, idx) => {
      if (idx !== modIdx) return m;
      return {
        ...m,
        lessons: m.lessons.map((l, lIdx) => lIdx === lesIdx ? { ...l, [field]: val } : l)
      };
    }));
  };

  // Form submit handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    const payload = {
      title,
      slug,
      description,
      thumbnail,
      category,
      level,
      published,
      instructor,
      modules
    };

    try {
      let res;
      if (isEditing && initialCourse) {
        res = await updateCourse(initialCourse._id, payload);
      } else {
        res = await createCourse(payload);
      }

      if (res.success) {
        setSuccess(res.message);
        router.push('/admin/courses');
        router.refresh();
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      console.error(err);
      setError('Connection failed. Please retry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Save action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/courses')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-900 bg-slate-900/40 px-2.5 py-1.5 rounded-lg transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <h2 className="text-xl font-bold text-white flex items-center gap-1.5">
            <FileEdit className="h-5 w-5 text-amber-500" />
            {isEditing ? 'Modify Syllabus Path' : 'Design Fresh Course'}
          </h2>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-amber-950 font-bold text-slate-950 text-xs px-4 py-2.5 transition shadow-lg shadow-amber-500/10 cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving parameters...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Course
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-950/20 border border-rose-500/15 p-3.5 text-xs font-medium text-rose-400">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/20 border border-emerald-500/15 p-3.5 text-xs font-medium text-emerald-400">
          <Sparkles className="h-4.5 w-4.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main detail sheets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns: Syllabus configuration */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Main details sheet */}
          <div className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-900 pb-2">Main Characteristics</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-400">Course Title</label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Next.js 16 Enterprise Architectures"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Slug path</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="kebab-case-slug"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="bg-slate-900 border border-slate-850 hover:border-slate-700 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 transition"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Category Tag</label>
                <input 
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Development, Design"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Difficulty Grade</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Thumbnail Image URL</label>
                <input 
                  type="text"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://images.unsplash.com/photo..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-400">Deep Description</label>
                <textarea 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize course goals, curriculum outline, and structural technical target audiences..."
                  className="w-full min-h-[100px] rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Visual Accordion Syllabus builder */}
          <div className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Visual Syllabus Builder</h3>
              <button
                type="button"
                onClick={addModule}
                className="flex items-center gap-1 text-[11px] font-bold text-amber-500 hover:text-amber-400 uppercase tracking-wider border border-amber-500/20 px-2.5 py-1 rounded-full bg-amber-950/10"
              >
                <Plus className="h-3.5 w-3.5" /> Add Module
              </button>
            </div>

            {modules.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-500 italic">No modules loaded. Click Add Module above.</p>
            ) : (
              <div className="space-y-4">
                {modules.map((mod, modIdx) => (
                  <div key={modIdx} className="border border-slate-900 rounded-xl bg-slate-950/40 p-4 space-y-4">
                    {/* Module title manager */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs font-bold text-slate-600 font-mono">M{modIdx + 1}</span>
                        <input 
                          type="text"
                          required
                          value={mod.title}
                          onChange={(e) => updateModuleTitle(modIdx, e.target.value)}
                          placeholder="Module Title"
                          className="flex-1 rounded-lg border border-slate-900 bg-slate-950 px-3 py-1.5 text-sm text-white font-semibold focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => addLesson(modIdx)}
                          className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500/80 hover:text-amber-400 uppercase tracking-widest border border-amber-500/10 px-2 py-1 rounded bg-amber-950/5"
                        >
                          <Plus className="h-3 w-3" /> Lesson
                        </button>
                        <button
                          type="button"
                          onClick={() => removeModule(modIdx)}
                          className="text-slate-600 hover:text-rose-400 p-1.5 transition"
                          title="Delete module section"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Module lessons manager list */}
                    <div className="space-y-3 pl-4 border-l border-slate-900">
                      {mod.lessons.length === 0 ? (
                        <p className="text-xs text-slate-650 italic py-1 pl-2">No lessons added to this module yet.</p>
                      ) : (
                        mod.lessons.map((les, lesIdx) => (
                          <div key={lesIdx} className="bg-slate-950/20 border border-slate-900 rounded-lg p-3 space-y-3 relative group">
                            
                            {/* Header details block */}
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[10px] font-bold text-slate-600 font-mono shrink-0">L{lesIdx + 1}</span>
                              <input 
                                type="text"
                                required
                                value={les.title}
                                onChange={(e) => updateLessonField(modIdx, lesIdx, 'title', e.target.value)}
                                placeholder="Lesson Title"
                                className="flex-1 rounded border border-slate-900 bg-slate-950 px-2 py-1 text-xs text-white focus:border-amber-500 focus:outline-none font-medium"
                              />
                              <button
                                type="button"
                                onClick={() => removeLesson(modIdx, lesIdx)}
                                className="text-white hover:text-rose-400 p-1 transition"
                                title="Remove lesson"
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Lesson parameters grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-semibold  uppercase tracking-wider">YouTube URL / ID</label>
                                <input 
                                  type="text"
                                  required
                                  value={les.youtubeUrl}
                                  onChange={(e) => updateLessonField(modIdx, lesIdx, 'youtubeUrl', e.target.value)}
                                  placeholder="https://youtu.be/..."
                                  className="w-full rounded border text-white border-slate-900 bg-slate-950 px-2 py-1 text-[11px] text-slate-350 focus:border-amber-500 focus:outline-none font-mono"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-semibold  uppercase tracking-wider">Duration (Minutes)</label>
                                <input 
                                  type="number"
                                  required
                                  value={les.duration}
                                  onChange={(e) => updateLessonField(modIdx, lesIdx, 'duration', e.target.value)}
                                  placeholder="10"
                                  className="w-full rounded border border-slate-900 text-white px-2 py-1 text-[11px] text-slate-350 focus:border-amber-500 focus:outline-none"
                                />
                              </div>
                              <div className="flex items-center gap-1.5 self-end pb-1.5 pl-1.5">
                                <input 
                                  type="checkbox"
                                  id={`prev-${modIdx}-${lesIdx}`}
                                  checked={les.isPreview}
                                  onChange={(e) => updateLessonField(modIdx, lesIdx, 'isPreview', e.target.checked)}
                                  className="rounded text-white border-slate-800  bg-slate-950 focus:ring-violet-500 shrink-0 h-4 w-4"
                                />
                                <label htmlFor={`prev-${modIdx}-${lesIdx}`} className="text-[10px] font-bold text-white uppercase tracking-widest cursor-pointer select-none">
                                  Free Preview
                                </label>
                              </div>
                            </div>

                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Instructor & Publish configuration sheets */}
        <div className="space-y-6 lg:sticky lg:top-24">
          
          {/* Action toggle sheet */}
          <div className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-900 pb-2">Publish Settings</h3>
            
            <div className="flex items-center justify-between border-b border-slate-900/50 pb-3">
              <div>
                <span className="text-xs font-bold text-white block">Published Status</span>
                <span className="text-[10px] text-slate-550 block">Visibility in catalog list.</span>
              </div>
              <input 
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="rounded border-slate-800 text-amber-500 bg-slate-950 focus:ring-amber-500 h-5 w-5 cursor-pointer"
              />
            </div>

            <div className="rounded-lg bg-amber-950/15 border border-amber-500/15 p-3.5 text-xs text-amber-400/90 leading-relaxed">
              Toggling published status to active makes the course instantly searchable on the main browse catalog page. Save in draft state while building syllabus structures.
            </div>
          </div>

          {/* Instructor detail config sheet */}
          <div className="border border-white/5 bg-slate-900/10 p-6 rounded-2xl backdrop-blur-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-900 pb-2">Instructor Identity</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Instructor Name</label>
                <input 
                  type="text"
                  required
                  value={instructor.name}
                  onChange={(e) => setInstructor(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Richard Hendricks"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Avatar Image URL</label>
                <input 
                  type="text"
                  value={instructor.avatar}
                  onChange={(e) => setInstructor(prev => ({ ...prev, avatar: e.target.value }))}
                  placeholder="https://api.dicebear.com/..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Instructor Biography</label>
                <textarea 
                  value={instructor.bio}
                  onChange={(e) => setInstructor(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Brief history of technical credentials..."
                  className="w-full min-h-[80px] rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
