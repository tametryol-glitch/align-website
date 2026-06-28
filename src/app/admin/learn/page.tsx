'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import {
  Plus, Save, Trash2, ArrowLeft, Loader2, GraduationCap,
  X, ChevronDown, ChevronUp, Image as ImageIcon, BookOpen,
} from 'lucide-react';
import Link from 'next/link';

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  duration_minutes: number | null;
  content: string;
  objectives: string[];
  key_terms: string[];
  chart_focus: string | null;
  quiz: any[];
  image_url: string | null;
  sort_order: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string | null;
  level_order: number;
  level_label: string | null;
  is_free: boolean;
  image_emoji: string | null;
  image_url: string | null;
  prerequisite_id: string | null;
  sort_order: number;
  learn_lessons: Lesson[];
}

type View = 'list' | 'editor';

export default function AdminLearnPage() {
  const [view, setView] = useState<View>('list');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function verify() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
      if (data?.is_admin) setVerified(true);
    }
    verify();
  }, []);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/learn');
      const data = await res.json();
      if (data.courses) setCourses(data.courses);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (verified) fetchCourses();
  }, [verified, fetchCourses]);

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted text-sm">Verifying admin access...</p>
      </div>
    );
  }

  function startNew() {
    setEditingCourse({
      id: '',
      title: '',
      description: '',
      level: null,
      level_order: courses.length + 1,
      level_label: '',
      is_free: false,
      image_emoji: '📘',
      image_url: null,
      prerequisite_id: null,
      sort_order: courses.length,
      learn_lessons: [],
    });
    setView('editor');
    setMessage('');
  }

  function editCourse(course: Course) {
    setEditingCourse({ ...course, learn_lessons: [...(course.learn_lessons || [])] });
    setView('editor');
    setMessage('');
  }

  async function deleteCourse(id: string) {
    if (!confirm('Delete this course and ALL its lessons permanently?')) return;
    await fetch(`/api/admin/learn?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    fetchCourses();
  }

  function backToList() {
    setView('list');
    setEditingCourse(null);
    setMessage('');
    fetchCourses();
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="border-b border-border-primary bg-bg-secondary">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-text-muted hover:text-text-primary transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
              <GraduationCap size={20} />
              Learn Manager
            </h1>
          </div>
          {view === 'list' && (
            <button onClick={startNew} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
              <Plus size={16} /> New Course
            </button>
          )}
          {view === 'editor' && (
            <button onClick={backToList} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Back to list
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {message && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
            {message}
          </div>
        )}

        {view === 'list' && (
          <CourseList courses={courses} loading={loading} onEdit={editCourse} onDelete={deleteCourse} />
        )}

        {view === 'editor' && editingCourse && (
          <CourseEditor
            course={editingCourse}
            setCourse={setEditingCourse}
            saving={saving}
            setSaving={setSaving}
            setMessage={setMessage}
            onSaved={backToList}
          />
        )}
      </div>
    </div>
  );
}

/* ── Course List ─────────────────────────────────────────────── */

function CourseList({
  courses,
  loading,
  onEdit,
  onDelete,
}: {
  courses: Course[];
  loading: boolean;
  onEdit: (c: Course) => void;
  onDelete: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-accent-primary" size={24} />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-20">
        <GraduationCap className="mx-auto mb-4 text-text-muted" size={48} />
        <p className="text-text-secondary mb-2">No courses yet</p>
        <p className="text-text-muted text-sm">Click &quot;New Course&quot; to create one, or run the seed script to import the starter curriculum.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-text-muted mb-4">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
      {courses.map((course) => (
        <div
          key={course.id}
          className="bg-bg-card border border-border-primary rounded-xl p-5 flex items-center justify-between gap-4 hover:border-accent-primary/20 transition-colors"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-accent-muted flex items-center justify-center text-2xl flex-shrink-0">
              {course.image_emoji || '📘'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {course.is_free ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Free</span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">Premium</span>
                )}
                <span className="text-xs text-text-muted">{course.level_label || course.level}</span>
              </div>
              <h3 className="text-base font-semibold text-text-primary truncate">{course.title}</h3>
              <p className="text-sm text-text-muted truncate">
                {(course.learn_lessons || []).length} lesson{(course.learn_lessons || []).length !== 1 ? 's' : ''} · /courses/{course.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onEdit(course)}
              className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary border border-border-primary rounded-lg hover:border-accent-primary/30 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(course.id)}
              className="p-1.5 text-text-muted hover:text-red-400 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Image upload helper (shared by course + lesson) ─────────── */

async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/admin/learn/upload', { method: 'POST', body: form });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.url;
}

function ImageField({
  url,
  onChange,
  setMessage,
  label,
}: {
  url: string | null;
  onChange: (url: string | null) => void;
  setMessage: (m: string) => void;
  label: string;
}) {
  const [uploading, setUploading] = useState(false);

  async function handle(file: File) {
    setUploading(true);
    setMessage('');
    try {
      const u = await uploadImage(file);
      onChange(u);
    } catch (e: any) {
      setMessage(`Image upload failed: ${e.message}`);
    }
    setUploading(false);
  }

  return (
    <div>
      <label className="block text-xs text-text-muted uppercase tracking-wider mb-3">{label}</label>
      {url ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="preview" className="w-full max-h-56 object-cover rounded-lg border border-border-primary" />
          <button
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-500/80 transition-colors"
            title="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-border-primary rounded-lg cursor-pointer hover:border-accent-primary/40 transition-colors text-text-muted">
          {uploading ? (
            <>
              <Loader2 size={22} className="animate-spin" />
              <span className="text-sm">Uploading…</span>
            </>
          ) : (
            <>
              <ImageIcon size={22} />
              <span className="text-sm">Click to upload an image</span>
              <span className="text-xs">JPG, PNG, WEBP or GIF · up to 8 MB</span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={uploading}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); e.target.value = ''; }}
          />
        </label>
      )}
    </div>
  );
}

/* ── Course Editor ───────────────────────────────────────────── */

function CourseEditor({
  course,
  setCourse,
  saving,
  setSaving,
  setMessage,
  onSaved,
}: {
  course: Course;
  setCourse: (c: Course) => void;
  saving: boolean;
  setSaving: (s: boolean) => void;
  setMessage: (m: string) => void;
  onSaved: () => void;
}) {
  const courseIsNew = !course.id;

  function update(field: keyof Course, value: any) {
    setCourse({ ...course, [field]: value });
  }

  /* Lessons */
  function addLesson() {
    const idx = course.learn_lessons.length;
    const newLesson: Lesson = {
      id: '',
      course_id: course.id,
      title: '',
      duration_minutes: 10,
      content: '',
      objectives: [],
      key_terms: [],
      chart_focus: null,
      quiz: [],
      image_url: null,
      sort_order: idx,
    };
    update('learn_lessons', [...course.learn_lessons, newLesson]);
  }

  function updateLesson(index: number, patch: Partial<Lesson>) {
    const updated = course.learn_lessons.map((l, i) => (i === index ? { ...l, ...patch } : l));
    update('learn_lessons', updated);
  }

  async function removeLesson(index: number) {
    const lesson = course.learn_lessons[index];
    if (lesson.id) {
      if (!confirm('Delete this lesson permanently?')) return;
      await fetch(`/api/admin/learn?type=lesson&id=${encodeURIComponent(lesson.id)}`, { method: 'DELETE' });
    }
    update('learn_lessons', course.learn_lessons.filter((_, i) => i !== index));
  }

  function moveLesson(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= course.learn_lessons.length) return;
    const updated = [...course.learn_lessons];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    update('learn_lessons', updated.map((l, i) => ({ ...l, sort_order: i })));
  }

  async function save() {
    if (!course.id || !course.title) {
      setMessage('Course id and title are required.');
      return;
    }

    setSaving(true);
    try {
      // 1. Save the course (POST if new, PUT otherwise).
      const courseRes = await fetch('/api/admin/learn', {
        method: courseIsNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: course.id,
          title: course.title,
          description: course.description,
          level: course.level,
          level_order: course.level_order,
          level_label: course.level_label,
          is_free: course.is_free,
          image_emoji: course.image_emoji,
          image_url: course.image_url,
          prerequisite_id: course.prerequisite_id,
          sort_order: course.sort_order,
        }),
      });
      const courseData = await courseRes.json();
      if (courseData.error) {
        setMessage(`Error: ${courseData.error}`);
        setSaving(false);
        return;
      }

      // 2. Upsert each lesson with a non-empty id.
      for (let i = 0; i < course.learn_lessons.length; i++) {
        const l = course.learn_lessons[i];
        if (!l.id || !l.title) continue;
        const res = await fetch('/api/admin/learn?type=lesson', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: l.id,
            course_id: course.id,
            title: l.title,
            duration_minutes: l.duration_minutes,
            content: l.content,
            objectives: l.objectives,
            key_terms: l.key_terms,
            chart_focus: l.chart_focus,
            quiz: l.quiz,
            image_url: l.image_url,
            sort_order: i,
          }),
        });
        const data = await res.json();
        if (data.error) {
          setMessage(`Lesson "${l.title}" failed: ${data.error}`);
          setSaving(false);
          return;
        }
      }

      setMessage(courseIsNew ? 'Course created!' : 'Course saved!');
      setSaving(false);
      onSaved();
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Course Image */}
      <div className="bg-bg-card border border-border-primary rounded-xl p-6">
        <ImageField
          url={course.image_url}
          onChange={(u) => update('image_url', u)}
          setMessage={setMessage}
          label="Course Image"
        />
      </div>

      {/* Course details */}
      <div className="bg-bg-card border border-border-primary rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">Course ID</label>
            <input
              type="text"
              value={course.id}
              disabled={!courseIsNew}
              onChange={(e) => update('id', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="l1-foundations"
              className="w-full bg-bg-secondary border border-border-primary rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">Emoji</label>
            <input
              type="text"
              value={course.image_emoji || ''}
              onChange={(e) => update('image_emoji', e.target.value)}
              placeholder="🌱"
              className="w-full bg-bg-secondary border border-border-primary rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">Title</label>
          <input
            type="text"
            value={course.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Level 1 — Foundations"
            className="w-full bg-bg-secondary border border-border-primary rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">Description</label>
          <textarea
            value={course.description}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
            placeholder="What this course covers..."
            className="w-full bg-bg-secondary border border-border-primary rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary resize-y"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">Level Label</label>
            <input
              type="text"
              value={course.level_label || ''}
              onChange={(e) => update('level_label', e.target.value)}
              placeholder="Beginner"
              className="w-full bg-bg-secondary border border-border-primary rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">Level Order</label>
            <input
              type="number"
              value={course.level_order}
              onChange={(e) => update('level_order', parseInt(e.target.value) || 0)}
              className="w-full bg-bg-secondary border border-border-primary rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={course.is_free}
                onChange={(e) => update('is_free', e.target.checked)}
                className="w-4 h-4 accent-accent-primary"
              />
              Free course
            </label>
          </div>
        </div>
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">Prerequisite Course ID (optional)</label>
          <input
            type="text"
            value={course.prerequisite_id || ''}
            onChange={(e) => update('prerequisite_id', e.target.value || null)}
            placeholder="l1-foundations"
            className="w-full bg-bg-secondary border border-border-primary rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
          />
        </div>
      </div>

      {/* Lessons */}
      <div className="bg-bg-card border border-border-primary rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <label className="text-xs text-text-muted uppercase tracking-wider flex items-center gap-2">
            <BookOpen size={14} /> Lessons
          </label>
          <button onClick={addLesson} className="text-sm text-accent-primary hover:underline flex items-center gap-1">
            <Plus size={14} /> Add lesson
          </button>
        </div>
        {course.learn_lessons.length === 0 && (
          <p className="text-sm text-text-muted">No lessons yet. Add one to begin.</p>
        )}
        <div className="space-y-4">
          {course.learn_lessons.map((lesson, i) => (
            <LessonEditor
              key={i}
              lesson={lesson}
              index={i}
              total={course.learn_lessons.length}
              onChange={(patch) => updateLesson(i, patch)}
              onRemove={() => removeLesson(i)}
              onMove={(dir) => moveLesson(i, dir)}
              setMessage={setMessage}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-bg-card border border-border-primary rounded-xl p-6 flex items-center justify-end gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="btn-primary text-sm px-5 py-2 flex items-center gap-2"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {courseIsNew ? 'Create Course' : 'Save Course'}
        </button>
      </div>
    </div>
  );
}

/* ── Lesson Editor (string-list helpers inline) ──────────────── */

function StringListField({
  label,
  values,
  placeholder,
  onChange,
}: {
  label: string;
  values: string[];
  placeholder: string;
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState('');
  function add() {
    const v = input.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput('');
  }
  return (
    <div>
      <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-accent-muted/10 text-accent-primary border border-accent-muted">
            {v}
            <button onClick={() => onChange(values.filter((x) => x !== v))} className="hover:text-red-400"><X size={11} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
        />
        <button onClick={add} className="px-3 py-2 text-sm border border-border-primary rounded-lg hover:border-accent-primary/30 text-text-secondary hover:text-text-primary transition-colors">
          Add
        </button>
      </div>
    </div>
  );
}

function LessonEditor({
  lesson,
  index,
  total,
  onChange,
  onRemove,
  onMove,
  setMessage,
}: {
  lesson: Lesson;
  index: number;
  total: number;
  onChange: (patch: Partial<Lesson>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  setMessage: (m: string) => void;
}) {
  const [open, setOpen] = useState(!lesson.id);

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-lg">
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <button onClick={() => onMove(-1)} className="text-text-muted hover:text-text-primary disabled:opacity-30" disabled={index === 0}>
            <ChevronUp size={14} />
          </button>
          <button onClick={() => onMove(1)} className="text-text-muted hover:text-text-primary disabled:opacity-30" disabled={index === total - 1}>
            <ChevronDown size={14} />
          </button>
        </div>
        <button onClick={() => setOpen(!open)} className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {index + 1}. {lesson.title || <span className="text-text-muted">Untitled lesson</span>}
          </p>
        </button>
        <button onClick={onRemove} className="text-text-muted hover:text-red-400 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border-primary pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-1.5">Lesson ID</label>
              <input
                type="text"
                value={lesson.id}
                onChange={(e) => onChange({ id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="l1-1-what-astrology-is"
                className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-1.5">Duration (minutes)</label>
              <input
                type="number"
                value={lesson.duration_minutes ?? ''}
                onChange={(e) => onChange({ duration_minutes: e.target.value === '' ? null : parseInt(e.target.value) || 0 })}
                className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-1.5">Title</label>
            <input
              type="text"
              value={lesson.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Lesson title"
              className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
            />
          </div>
          <div>
            <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-1.5">Content</label>
            <textarea
              value={lesson.content}
              onChange={(e) => onChange({ content: e.target.value })}
              rows={6}
              placeholder="Lesson body text..."
              className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary resize-y"
            />
          </div>
          <ImageField
            url={lesson.image_url}
            onChange={(u) => onChange({ image_url: u })}
            setMessage={setMessage}
            label="Lesson Image"
          />
          <StringListField
            label="Objectives"
            values={lesson.objectives || []}
            placeholder="Add an objective and press Enter"
            onChange={(v) => onChange({ objectives: v })}
          />
          <StringListField
            label="Key Terms"
            values={lesson.key_terms || []}
            placeholder="Add a key term and press Enter"
            onChange={(v) => onChange({ key_terms: v })}
          />
          <div>
            <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-1.5">Chart Focus</label>
            <input
              type="text"
              value={lesson.chart_focus || ''}
              onChange={(e) => onChange({ chart_focus: e.target.value || null })}
              placeholder="What chart feature this lesson highlights"
              className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
}
