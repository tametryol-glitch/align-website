'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Image, Video, Upload, X, Grid3X3, Play } from 'lucide-react';

type MediaType = 'photo' | 'video';
type FilterTab = 'all' | 'photo' | 'video';

interface MediaItem {
  id: string;
  user_id: string;
  type: MediaType;
  url: string;
  caption: string | null;
  visibility: 'public' | 'private';
  created_at: string;
}

export default function GalleryPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) fetchMedia();
  }, [user]);

  async function fetchMedia() {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data) setItems(data);
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('post-media')
      .upload(path, file);

    if (uploadError) {
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('post-media')
      .getPublicUrl(path);

    const type: MediaType = file.type.startsWith('video/') ? 'video' : 'photo';

    await supabase.from('media_items').insert({
      user_id: user.id,
      type,
      url: urlData.publicUrl,
      caption: null,
      visibility: 'public',
    });

    setUploading(false);
    fetchMedia();
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter);

  const tabs: { key: FilterTab; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All', icon: <Grid3X3 className="w-4 h-4" /> },
    { key: 'photo', label: 'Photos', icon: <Image className="w-4 h-4" /> },
    { key: 'video', label: 'Videos', icon: <Video className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Image className="w-8 h-8 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">Gallery</h1>
            <p className="text-text-tertiary text-sm">Your photos and videos</p>
          </div>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn-primary flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === tab.key
                ? 'bg-accent-primary text-white'
                : 'bg-bg-tertiary text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading media...</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-text-tertiary">No media yet. Upload your first photo or video.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="relative aspect-square rounded-xl overflow-hidden bg-bg-tertiary group"
            >
              {item.type === 'photo' ? (
                <img
                  src={item.url}
                  alt={item.caption || 'Gallery photo'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-bg-tertiary">
                  <Play className="w-10 h-10 text-text-muted" />
                </div>
              )}
              {item.type === 'video' && (
                <div className="absolute top-2 right-2">
                  <Video className="w-4 h-4 text-white drop-shadow" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Full-size Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-4 right-4 text-white hover:text-text-muted transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-4xl max-h-[90vh] w-full">
            {selectedItem.type === 'photo' ? (
              <img
                src={selectedItem.url}
                alt={selectedItem.caption || 'Full size'}
                className="w-full h-full object-contain rounded-xl"
              />
            ) : (
              <video
                src={selectedItem.url}
                controls
                className="w-full h-full object-contain rounded-xl"
              />
            )}
            {selectedItem.caption && (
              <p className="text-white text-center mt-4 text-sm">{selectedItem.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
