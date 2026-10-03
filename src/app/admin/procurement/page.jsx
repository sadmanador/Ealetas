'use client';

import React, { useState, useEffect } from 'react';
import { Compass, Plus, Loader2, Calendar, DollarSign, FileText, CheckCircle } from 'lucide-react';

export default function AdminProcurementPage() {
  const [logs, setLogs] = useState([]);
  const [totalExpenditure, setTotalExpenditure] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [transportCost, setTransportCost] = useState('');
  const [foodCost, setFoodCost] = useState('');
  const [wholesaleProductCost, setWholesaleProductCost] = useState('');
  const [otherCost, setOtherCost] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/procurement');
      const data = await res.json();
      setLogs(data.logs || []);
      setTotalExpenditure(data.totalExpenditure || 0);
    } catch (e) {
      console.error('Error fetching procurement logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const calculatedDayTotal =
    (Number(transportCost) || 0) +
    (Number(foodCost) || 0) +
    (Number(wholesaleProductCost) || 0) +
    (Number(otherCost) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/procurement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          transportCost,
          foodCost,
          wholesaleProductCost,
          otherCost,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save log');
      }

      setSuccessMsg('✓ Procurement travel expense logged successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);

      // Reset form
      setTransportCost('');
      setFoodCost('');
      setWholesaleProductCost('');
      setOtherCost('');
      setNotes('');
      fetchLogs();
    } catch (err) {
      alert(err.message || 'Error saving procurement trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eae5de]">
        <div>
          <span className="text-[10px] tracking-widest text-[#b88b42] uppercase font-semibold">
            Expense Auditing & Trips
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1a17]">
            Procurement & Travel Cost Tracker
          </h1>
        </div>

        <div className="p-3 bg-white border border-[#eae5de] rounded-xs shadow-xs text-xs">
          <span className="text-gray-500 uppercase tracking-wider block text-[10px]">
            Total Procurement Spend
          </span>
          <span className="text-xl font-serif font-semibold text-[#1c1a17]">
            ৳{totalExpenditure?.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Log New Trip Form */}
      <div className="bg-white border border-[#eae5de] rounded-xs p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#f0ece5]">
          <Compass className="w-4 h-4 text-[#b88b42]" />
          <h2 className="font-serif text-lg font-medium text-[#1c1a17]">
            Record Daily Procurement & Travel Trip
          </h2>
        </div>

        {successMsg && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Date */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                Trip Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
              />
            </div>

            {/* Transport */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                Transport Cost (৳)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Bus, CNG, Uber..."
                value={transportCost}
                onChange={(e) => setTransportCost(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
              />
            </div>

            {/* Food */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                Food & Meals (৳)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Daily allowance..."
                value={foodCost}
                onChange={(e) => setFoodCost(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
              />
            </div>

            {/* Wholesale Price Per Unit / Batch */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                Wholesale Product Cost (৳)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Purchased inventory..."
                value={wholesaleProductCost}
                onChange={(e) => setWholesaleProductCost(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
              />
            </div>

            {/* Other */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                Other Expenses (৳)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Packaging, tips..."
                value={otherCost}
                onChange={(e) => setOtherCost(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
              Procurement Trip Details & Wholesale Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Visited Tanti Bazar wholesale jewelers, bought 10 emerald raw cuts and 14k gold chains..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#faf8f5] border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
            />
          </div>

          {/* Day Total & Submit */}
          <div className="flex items-center justify-between pt-2 border-t border-[#f0ece5]">
            <div className="text-xs">
              <span className="text-gray-500">Calculated Trip Expenditure: </span>
              <span className="font-semibold text-base text-[#b88b42]">
                ৳{calculatedDayTotal.toLocaleString()}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#1c1a17] text-white uppercase tracking-widest font-medium text-xs hover:bg-[#b88b42] transition-colors rounded-xs shadow-xs flex items-center gap-1.5"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Save Procurement Record
            </button>
          </div>
        </form>
      </div>

      {/* Historical Travel Costs Table */}
      <div className="bg-white border border-[#eae5de] rounded-xs overflow-x-auto shadow-xs">
        <div className="p-4 border-b border-[#eae5de] bg-[#faf8f5]">
          <h3 className="font-serif text-base font-medium text-[#1c1a17]">
            Historical Procurement & Travel Trips
          </h3>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#b88b42] animate-spin" />
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf8f5] border-b border-[#eae5de] text-[11px] uppercase tracking-wider text-[#6b665f]">
              <tr>
                <th className="p-3.5">Trip Date</th>
                <th className="p-3.5">Transport</th>
                <th className="p-3.5">Food & Meals</th>
                <th className="p-3.5">Wholesale Products</th>
                <th className="p-3.5">Other Cost</th>
                <th className="p-3.5">Total Day Spend</th>
                <th className="p-3.5">Trip Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece5]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    No procurement trips logged yet. Use the form above to record your first trip.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#faf8f5]/50 transition-colors">
                    <td className="p-3.5 font-medium text-gray-900 font-mono">
                      {new Date(log.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-3.5 text-gray-600">৳{log.transportCost?.toLocaleString()}</td>
                    <td className="p-3.5 text-gray-600">৳{log.foodCost?.toLocaleString()}</td>
                    <td className="p-3.5 text-gray-600 font-medium">৳{log.wholesaleProductCost?.toLocaleString()}</td>
                    <td className="p-3.5 text-gray-600">৳{log.otherCost?.toLocaleString()}</td>
                    <td className="p-3.5 font-semibold text-purple-900 text-sm">
                      ৳{log.totalCost?.toLocaleString()}
                    </td>
                    <td className="p-3.5 max-w-xs text-gray-500 line-clamp-2">
                      {log.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
