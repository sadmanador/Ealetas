'use client';

import React, { useState, useEffect } from 'react';
import TipTapEditor from '@/components/TipTapEditor';
import {
  FileText,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  BookOpen,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';

const CMS_PAGES = [
  {
    slug: 'words-from-founder',
    title: 'Words from the Founder',
    publicUrl: '/founder',
    icon: BookOpen,
    desc: 'Public statement from the founder with images and vision statement.',
  },
  {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    publicUrl: '/terms',
    icon: ShieldCheck,
    desc: 'Customer terms of purchase, delivery responsibility, and order agreements.',
  },
  {
    slug: 'return-policy',
    title: 'Return Policy',
    publicUrl: '/returns',
    icon: RotateCcw,
    desc: 'Product exchange rules, inspection periods, and refund guarantees.',
  },
];

export default function AdminPagesManager() {
  const [selectedSlug, setSelectedSlug] = useState('words-from-founder');
  const [pageTitle, setPageTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusNotice, setStatusNotice] = useState({ type: '', text: '' });

  const activeMeta = CMS_PAGES.find((p) => p.slug === selectedSlug);

  const fetchPage = async (slug) => {
    setIsLoading(true);
    setStatusNotice({ type: '', text: '' });
    try {
      const res = await fetch(`/api/pages?slug=${slug}`);
      const data = await res.json();
      if (data.page) {
        setPageTitle(data.page.title);
        setContent(data.page.content);
      }
    } catch (err) {
      console.error('Error fetching CMS page:', err);
      setStatusNotice({ type: 'error', text: 'Failed to load page content' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(selectedSlug);
  }, [selectedSlug]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusNotice({ type: '', text: '' });

    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selectedSlug,
          title: pageTitle,
          content,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusNotice({ type: 'success', text: 'Page updated successfully!' });
      } else {
        setStatusNotice({ type: 'error', text: data.error || 'Failed to update page' });
      }
    } catch (err) {
      console.error('Error saving CMS page:', err);
      setStatusNotice({ type: 'error', text: 'Connection error while saving' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eae5de]">
        <div>
          <span className="text-[10px] tracking-widest text-[#0f388a] uppercase font-semibold">
            Content Management (TipTap Editor)
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#0d2342]">
            Dynamic CMS Pages
          </h1>
        </div>
        {activeMeta && (
          <Link
            href={activeMeta.publicUrl}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#d2e2f6] text-xs font-semibold uppercase tracking-wider text-[#0f388a] hover:bg-[#f0f6fd] rounded-lg transition-colors"
          >
            <span>Preview Live Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Page Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CMS_PAGES.map((p) => {
          const Icon = p.icon;
          const isSelected = selectedSlug === p.slug;
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => setSelectedSlug(p.slug)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-white border-[#0f388a] shadow-md ring-2 ring-[#0f388a]/10'
                  : 'bg-white/70 border-[#e2edf8] hover:border-[#b8d4f7] hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-[#0f388a] text-white' : 'bg-[#f0f6fd] text-[#0f388a]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-medium text-xs text-[#0d2342]">{p.title}</h3>
              </div>
              <p className="text-[11px] text-[#6e85a0] leading-snug">{p.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Editor Container */}
      <div className="bg-white p-6 border border-[#e2edf8] rounded-xl shadow-xs space-y-5">
        {statusNotice.text && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              statusNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusNotice.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusNotice.text}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#6e85a0] gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#0f388a]" />
            <span className="text-xs">Loading page content...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#0d2342] mb-1">
                Page Header Title
              </label>
              <input
                type="text"
                required
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#d2e2f6] rounded-lg text-sm text-[#0d2342] focus:outline-none focus:border-[#0f388a]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#0d2342]">
                  Page Body (TipTap Rich Editor with Image Embedding)
                </label>
                <span className="text-[11px] text-[#6e85a0]">
                  Click "Upload Image" or "Image URL" to place images anywhere
                </span>
              </div>
              <TipTapEditor
                key={selectedSlug}
                content={content}
                onChange={(html) => setContent(html)}
              />
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0f388a] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#0a2561] transition-colors rounded-lg shadow-md disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save & Publish Live
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
