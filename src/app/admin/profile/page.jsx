'use client';

import React, { useState, useEffect } from 'react';
import { UserCog, Phone, Mail, Lock, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function AdminProfilePage() {
  const { update } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.admin) {
          setName(data.admin.name || '');
          setEmail(data.admin.email || '');
          setPhone(data.admin.phone || '');
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setNotice('');
    setErrorMsg('');

    try {
      const payload = {
        name,
        phone,
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setNotice('✓ Admin profile and alert phone number updated successfully!');
      setCurrentPassword('');
      setNewPassword('');

      // Refresh NextAuth session
      if (update) {
        update({ name, phone });
      }

      setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eae5de]">
        <div>
          <span className="text-[10px] tracking-widest text-[#b88b42] uppercase font-semibold">
            Admin Profile & SMS Configuration
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1a17]">
            Profile & Alert Settings
          </h1>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-[#b88b42] animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white border border-[#eae5de] rounded-xs p-6 shadow-xs space-y-5 text-xs">
          {/* Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#f0ece5]">
              <UserCog className="w-4 h-4 text-[#b88b42]" />
              <h2 className="font-serif text-base font-medium text-[#1c1a17]">
                Personal & SMS Details
              </h2>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                Admin Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#dcd5cb] text-xs rounded-xs focus:outline-none focus:border-[#b88b42]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                Admin Email (Login ID)
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3 py-2 bg-gray-100 border border-[#dcd5cb] text-xs text-gray-500 rounded-xs cursor-not-allowed"
              />
            </div>

            {/* Vital Phone Number */}
            <div className="p-3.5 bg-[#fbf9f6] border border-[#ebdcc7] rounded-xs space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#b88b42]" />
                Admin Mobile Number for BulkSMSBD Alerts *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 88017XXXXXXXX or 017XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#dcd5cb] text-xs font-semibold rounded-xs focus:outline-none focus:border-[#b88b42]"
              />
              <p className="text-[11px] text-[#6b665f] leading-relaxed">
                🚨 When customers place an order, BulkSMSBD sends an instant SMS notification to this mobile number!
              </p>
            </div>
          </div>

          {/* Change Password (Optional) */}
          <div className="space-y-4 pt-4 border-t border-[#f0ece5]">
            <div className="flex items-center gap-2 pb-2 border-b border-[#f0ece5]">
              <Lock className="w-4 h-4 text-[#b88b42]" />
              <h2 className="font-serif text-base font-medium text-[#1c1a17]">
                Change Password (Optional)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#faf8f5] border border-[#dcd5cb] text-xs rounded-xs focus:outline-none focus:border-[#b88b42]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#faf8f5] border border-[#dcd5cb] text-xs rounded-xs focus:outline-none focus:border-[#b88b42]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#eae5de] flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#1c1a17] text-white uppercase tracking-widest font-medium text-xs hover:bg-[#b88b42] transition-colors rounded-xs shadow-xs flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Profile & Phone Number
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
