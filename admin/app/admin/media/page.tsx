'use client';

import { useEffect, useState, useRef } from 'react';
import Topbar from '@/components/admin/Topbar';
import { Upload, Trash2, Copy, Image as ImageIcon, File } from 'lucide-react';

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  type: string;
  mimeType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  altText?: string;
  createdAt: string;
}

function formatSize(bytes?: number) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = () => {
    setLoading(true);
    fetch('/api/admin/media').then((r) => r.json()).then(({ data }) => setMedia(data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);
      await fetch('/api/admin/media', { method: 'POST', body: formData });
      setUploadProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setUploading(false);
    fetchMedia();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleUpload(e.dataTransfer.files);
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    setSelected(null);
    fetchMedia();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Topbar title="Media Library" subtitle="Upload and manage assets" />
      <div className="p-6 space-y-5">
        {/* Upload zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${dragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40'}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.pdf" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
          <Upload size={28} className={`mx-auto mb-3 ${dragging ? 'text-accent' : 'text-text-muted'}`} />
          <p className="text-sm text-text-secondary">Drag & drop files here, or <span className="text-accent">click to browse</span></p>
          <p className="text-xs text-text-muted mt-1">Images, videos, PDFs · Max 10MB per file</p>

          {uploading && (
            <div className="mt-4 max-w-xs mx-auto">
              <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-xs text-text-muted mt-1">Uploading... {uploadProgress}%</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <ImageIcon size={13} />
          <span>{media.length} assets</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(12)].map((_, i) => <div key={i} className="aspect-square bg-surface rounded-lg animate-pulse" />)}
          </div>
        ) : media.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-16 text-text-muted">
            <ImageIcon size={32} className="mb-3 opacity-30" />
            <p className="text-sm">No media uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {media.map((item) => (
              <div
                key={item.id}
                className={`relative group aspect-square bg-surface-alt rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selected?.id === item.id ? 'border-accent' : 'border-transparent hover:border-border'}`}
                onClick={() => setSelected(item)}
              >
                {item.type === 'IMAGE' ? (
                  <img src={item.url} alt={item.altText || item.filename} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-text-muted gap-2">
                    <File size={24} />
                    <span className="text-[10px] truncate px-1 w-full text-center">{item.filename}</span>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); copyUrl(item.url, item.id); }} className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-white transition-colors">
                    {copied === item.id ? <span className="text-[10px] text-success">✓</span> : <Copy size={12} />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }} className="p-1.5 bg-white/10 hover:bg-danger/40 rounded text-white hover:text-danger transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected panel */}
        {selected && (
          <div className="glass-card p-5 flex gap-5 items-start">
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-alt">
              {selected.type === 'IMAGE' ? (
                <img src={selected.url} alt={selected.altText || ''} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted"><File size={24} /></div>
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="font-medium text-sm truncate">{selected.filename}</div>
              <div className="text-xs text-text-muted space-y-0.5">
                <div>{selected.mimeType} · {formatSize(selected.sizeBytes)}</div>
                {selected.width && <div>{selected.width} × {selected.height}px</div>}
              </div>
              <div className="flex items-center gap-2">
                <input className="input-field flex-1 text-xs font-mono" value={selected.url} readOnly />
                <button onClick={() => copyUrl(selected.url, selected.id)} className="btn-secondary text-xs py-2">
                  {copied === selected.id ? '✓ Copied' : <><Copy size={12} />Copy</>}
                </button>
              </div>
            </div>
            <button onClick={() => setDeleteId(selected.id)} className="btn-danger text-xs py-2"><Trash2 size={13} />Delete</button>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm p-6 animate-slide-up text-center space-y-4">
            <Trash2 size={32} className="text-danger mx-auto" />
            <h2 className="text-lg font-semibold">Delete this asset?</h2>
            <p className="text-text-secondary text-sm">This will also remove it from Cloudinary.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
