'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle, Loader2, Truck, Bell } from 'lucide-react';

export default function AdminSettingsPage() {
  const [insideCharge, setInsideCharge] = useState(80);
  const [outsideCharge, setOutsideCharge] = useState(120);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [noticeBannerText, setNoticeBannerText] = useState('Timeless Beauty Inspired by the Treasures of the Sea ✦ Fast & Insured Delivery across Bangladesh (Dhaka ৳80 | Nationwide ৳120)');
  const [noticeBannerEnabled, setNoticeBannerEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.insideDhakaDeliveryCharge !== undefined) {
          setInsideCharge(data.insideDhakaDeliveryCharge);
        }
        if (data.outsideDhakaDeliveryCharge !== undefined) {
          setOutsideCharge(data.outsideDhakaDeliveryCharge);
        }
        if (data.smsAlertsEnabled !== undefined) {
          setSmsAlertsEnabled(data.smsAlertsEnabled);
        }
        if (data.noticeBannerText !== undefined) {
          setNoticeBannerText(data.noticeBannerText);
        }
        if (data.noticeBannerEnabled !== undefined) {
          setNoticeBannerEnabled(data.noticeBannerEnabled);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedNotice('');

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insideDhakaDeliveryCharge: Number(insideCharge),
          outsideDhakaDeliveryCharge: Number(outsideCharge),
          smsAlertsEnabled,
          noticeBannerText,
          noticeBannerEnabled,
        }),
      });

      if (!res.ok) throw new Error('Failed to update settings');

      setSavedNotice('✓ Store settings & notice banner updated successfully!');
      setTimeout(() => setSavedNotice(''), 3000);
    } catch (err) {
      alert(err.message || 'Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eae5de]">
        <div>
          <span className="text-[10px] tracking-widest text-[#b88b42] uppercase font-semibold">
            Store Configuration
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1a17]">
            Delivery Fees & Store Settings
          </h1>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{savedNotice}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-[#b88b42] animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white border border-[#eae5de] rounded-xs p-6 shadow-xs space-y-6 text-xs">
          {/* Delivery Charges Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#f0ece5]">
              <Truck className="w-4 h-4 text-[#b88b42]" />
              <h2 className="font-serif text-base font-medium text-[#1c1a17]">
                Configurable Delivery Charges
              </h2>
            </div>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              Customers will see and pay these delivery charges dynamically on checkout based on their chosen zone.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                  Inside Dhaka City Corp (North & South) (৳) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={insideCharge}
                  onChange={(e) => setInsideCharge(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf8f5] border border-[#dcd5cb] text-sm font-semibold rounded-xs focus:outline-none focus:border-[#b88b42]"
                />
                <span className="text-[10px] text-gray-500">Default: 80 Taka</span>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                  Outside Dhaka / Nationwide (৳) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={outsideCharge}
                  onChange={(e) => setOutsideCharge(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf8f5] border border-[#dcd5cb] text-sm font-semibold rounded-xs focus:outline-none focus:border-[#b88b42]"
                />
                <span className="text-[10px] text-gray-500">Default: 120 Taka</span>
              </div>
            </div>
          </div>

          {/* SMS Notification Settings */}
          <div className="space-y-3 pt-4 border-t border-[#f0ece5]">
            <div className="flex items-center gap-2 pb-2 border-b border-[#f0ece5]">
              <Bell className="w-4 h-4 text-[#b88b42]" />
              <h2 className="font-serif text-base font-medium text-[#1c1a17]">
                BulkSMSBD Automated Alerts
              </h2>
            </div>
            <p className="text-gray-500 text-[11px]">
              When enabled, our backend sends instant SMS alerts to all admin phone numbers recorded in the system upon each customer purchase.
            </p>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={smsAlertsEnabled}
                onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#b88b42]"
              />
              <span className="font-medium text-gray-800">
                Enable Instant SMS Alerts to Admin Phone Numbers on new orders
              </span>
            </label>
          </div>

          {/* Top Marquee Notice Banner Section */}
          <div className="space-y-4 pt-4 border-t border-[#f0ece5]">
            <div className="flex items-center justify-between pb-2 border-b border-[#f0ece5]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#0f388a]" />
                <h2 className="font-serif text-base font-medium text-[#1c1a17]">
                  Top Marquee Notice Banner
                </h2>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noticeBannerEnabled}
                  onChange={(e) => setNoticeBannerEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#0f388a]"
                />
                <span className="text-xs font-semibold text-[#0d2342]">
                  {noticeBannerEnabled ? 'Banner Enabled' : 'Banner Disabled'}
                </span>
              </label>
            </div>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              When enabled, this announcement continuously loops across the very top of the storefront as a smooth marquee.
            </p>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                Announcement Text *
              </label>
              <textarea
                rows={2}
                value={noticeBannerText}
                onChange={(e) => setNoticeBannerText(e.target.value)}
                placeholder="e.g. Special Eid Collection Launch! Insured nationwide delivery..."
                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#dcd5cb] text-xs rounded-xs focus:outline-none focus:border-[#0f388a]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#eae5de] flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#0f388a] text-white uppercase tracking-widest font-medium text-xs hover:bg-[#0a2561] transition-colors rounded-xs shadow-xs flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Store Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
