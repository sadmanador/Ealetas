'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function AdminFaqsManager() {
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState({ type: '', text: '' });

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/faqs');
      const data = await res.json();
      setFaqs(data.faqs || []);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openCreateModal = () => {
    setEditingFaq(null);
    setQuestion('');
    setAnswer('');
    setOrder(faqs.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingFaq(item);
    setQuestion(item.question);
    setAnswer(item.answer);
    setOrder(item.order);
    setIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setNotice({ type: '', text: '' });

    try {
      const method = editingFaq ? 'PATCH' : 'POST';
      const payload = editingFaq
        ? { id: editingFaq.id, question, answer, order, isActive }
        : { question, answer, order, isActive };

      const res = await fetch('/api/faqs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchFaqs();
        setNotice({ type: 'success', text: 'FAQ saved successfully!' });
      } else {
        const data = await res.json();
        setNotice({ type: 'error', text: data.error || 'Failed to save FAQ' });
      }
    } catch (err) {
      console.error('Error saving FAQ:', err);
      setNotice({ type: 'error', text: 'Connection error while saving' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ question?')) return;
    try {
      const res = await fetch(`/api/faqs?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchFaqs();
        setNotice({ type: 'success', text: 'FAQ deleted' });
      }
    } catch (err) {
      console.error('Error deleting FAQ:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eae5de]">
        <div>
          <span className="text-[10px] tracking-widest text-[#0f388a] uppercase font-semibold">
            Storefront Knowledge Base
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#0d2342]">
            Home FAQ Management
          </h1>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0f388a] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#0a2561] transition-colors rounded-lg shadow-md"
        >
          <Plus className="w-4 h-4" /> Add FAQ Question
        </button>
      </div>

      {notice.text && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* FAQs List */}
      <div className="bg-white border border-[#e2edf8] rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#6e85a0] gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#0f388a]" />
            <span className="text-xs">Loading FAQ list...</span>
          </div>
        ) : faqs.length === 0 ? (
          <div className="py-16 text-center text-[#6e85a0] text-sm">
            No FAQ items found. Click above to add your first question!
          </div>
        ) : (
          <div className="divide-y divide-[#edf4fc]">
            {faqs.map((f) => (
              <div key={f.id} className="p-5 flex items-start justify-between gap-4 hover:bg-[#f8fbfe] transition-colors">
                <div className="space-y-1.5 flex-grow">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#f0f6fd] text-[#0f388a] text-xs font-bold flex items-center justify-center shrink-0">
                      {f.order}
                    </span>
                    <h3 className="font-serif text-base font-semibold text-[#0d2342]">{f.question}</h3>
                    {!f.isActive && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-500 font-medium">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5e7692] leading-relaxed pl-8 whitespace-pre-line">{f.answer}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(f)}
                    className="p-2 text-[#0f388a] hover:bg-[#e0edfb] rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(f.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white border border-[#e2edf8] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#edf4fc] pb-3">
              <h2 className="font-serif text-lg font-semibold text-[#0d2342]">
                {editingFaq ? 'Edit FAQ Question' : 'Add New FAQ Question'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#0d2342] mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Do you deliver outside Dhaka?"
                  className="w-full px-3.5 py-2 border border-[#d2e2f6] rounded-lg text-sm text-[#0d2342] focus:outline-none focus:border-[#0f388a]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#0d2342] mb-1">
                  Answer *
                </label>
                <textarea
                  rows={4}
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Detailed answer for your customers..."
                  className="w-full px-3.5 py-2 border border-[#d2e2f6] rounded-lg text-sm text-[#0d2342] focus:outline-none focus:border-[#0f388a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#0d2342] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d2e2f6] rounded-lg text-sm focus:outline-none focus:border-[#0f388a]"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#0d2342]">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-[#0f388a]"
                    />
                    <span>Visible on Storefront</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#edf4fc]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#d2e2f6] text-xs uppercase font-semibold text-[#6e85a0] rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#0f388a] text-white text-xs uppercase tracking-wider font-semibold rounded-lg hover:bg-[#0a2561] disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save FAQ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
