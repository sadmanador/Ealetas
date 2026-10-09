'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, MapPin, ShoppingBag, Loader2, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.phone.includes(q) ||
      c.name.toLowerCase().includes(q) ||
      (c.district && c.district.toLowerCase().includes(q)) ||
      (c.fullAddress && c.fullAddress.toLowerCase().includes(q))
    );
  });

  const [updatingCustomerId, setUpdatingCustomerId] = useState(null);
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [tempNotes, setTempNotes] = useState('');

  const handleToggleBlacklist = async (customer) => {
    const nextState = !customer.isBlacklisted;
    const confirmMsg = nextState
      ? `Are you sure you want to BLACKLIST ${customer.name} (${customer.phone})? They will be blocked from placing orders.`
      : `Remove blacklist restriction for ${customer.name}?`;
    if (!window.confirm(confirmMsg)) return;

    setUpdatingCustomerId(customer.id);
    try {
      const res = await fetch('/api/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customer.id, isBlacklisted: nextState }),
      });
      if (res.ok) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === customer.id ? { ...c, isBlacklisted: nextState } : c))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingCustomerId(null);
    }
  };

  const handleToggleFraudRisk = async (customer) => {
    const nextState = !customer.isFraudRisk;
    setUpdatingCustomerId(customer.id);
    try {
      const res = await fetch('/api/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customer.id, isFraudRisk: nextState }),
      });
      if (res.ok) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === customer.id ? { ...c, isFraudRisk: nextState } : c))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingCustomerId(null);
    }
  };

  const handleSaveNotes = async (customerId) => {
    setUpdatingCustomerId(customerId);
    try {
      const res = await fetch('/api/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customerId, fraudNotes: tempNotes }),
      });
      if (res.ok) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === customerId ? { ...c, fraudNotes: tempNotes } : c))
        );
        setEditingNotesId(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingCustomerId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eae5de]">
        <div>
          <span className="text-[10px] tracking-widest text-[#b88b42] uppercase font-semibold">
            CRM & Risk Protection
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1a17]">
            Customer Directory & Fraud Shield
          </h1>
        </div>
        <div className="text-xs text-[#6b665f]">
          Total Registered: <span className="font-semibold text-gray-900">{customers.length}</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3 border border-[#eae5de] rounded-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search customer by mobile number, name, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#faf8f5] border border-[#dcd5cb] text-xs rounded-xs focus:outline-none focus:border-[#b88b42]"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-[#b88b42] animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-[#eae5de] rounded-xs overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf8f5] border-b border-[#eae5de] text-[11px] uppercase tracking-wider text-[#6b665f]">
              <tr>
                <th className="p-3.5">Customer & Status</th>
                <th className="p-3.5">Phone Number (Key)</th>
                <th className="p-3.5">Default Shipping Address</th>
                <th className="p-3.5">Orders Count</th>
                <th className="p-3.5">Total Spent</th>
                <th className="p-3.5">Risk Controls & Notes</th>
                <th className="p-3.5 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece5]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    No customers found. Customers are recorded automatically upon checkout.
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#faf8f5]/50 transition-colors align-top">
                    <td className="p-3.5 space-y-1">
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="flex flex-wrap gap-1">
                        {customer.isBlacklisted && (
                          <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                            Blacklisted
                          </span>
                        )}
                        {customer.isFraudRisk && (
                          <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                            Fraud Risk
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-mono font-semibold text-[#b88b42]">
                        <Phone className="w-3.5 h-3.5" />
                        <a href={`tel:${customer.phone}`} className="hover:underline">
                          {customer.phone}
                        </a>
                      </div>
                    </td>

                    <td className="p-3.5 max-w-xs text-gray-600 space-y-0.5">
                      <div className="font-medium text-gray-800 text-[11px]">
                        {customer.upazila ? `${customer.upazila}, ` : ''}
                        {customer.district ? `${customer.district}, ` : ''}
                        {customer.division || ''}
                      </div>
                      <div className="text-[11px] text-gray-500 line-clamp-1">
                        {customer.fullAddress}
                      </div>
                    </td>

                    <td className="p-3.5 font-semibold text-gray-800">
                      {customer.ordersCount} orders
                    </td>

                    <td className="p-3.5 font-semibold text-emerald-800">
                      ৳{customer.totalSpent?.toLocaleString()}
                    </td>

                    {/* Fraud Flagging & Blacklisting Actions */}
                    <td className="p-3.5 max-w-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleFraudRisk(customer)}
                          disabled={updatingCustomerId === customer.id}
                          className={`px-2 py-0.5 text-[10px] uppercase font-semibold rounded-xs border transition-colors ${
                            customer.isFraudRisk
                              ? 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700'
                              : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
                          }`}
                        >
                          {customer.isFraudRisk ? 'Flagged (Unflag)' : 'Flag Fraud'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleBlacklist(customer)}
                          disabled={updatingCustomerId === customer.id}
                          className={`px-2 py-0.5 text-[10px] uppercase font-semibold rounded-xs border transition-colors ${
                            customer.isBlacklisted
                              ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700'
                              : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
                          }`}
                        >
                          {customer.isBlacklisted ? 'Blacklisted (Lift)' : 'Blacklist'}
                        </button>
                      </div>

                      {/* Notes Section */}
                      {editingNotesId === customer.id ? (
                        <div className="space-y-1">
                          <textarea
                            rows={2}
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            placeholder="Add reason, parcel return history, fake order notes..."
                            className="w-full p-1.5 border border-[#dcd5cb] text-[11px] rounded-xs bg-[#faf8f5] focus:outline-none"
                          />
                          <div className="flex gap-1 justify-end">
                            <button
                              type="button"
                              onClick={() => setEditingNotesId(null)}
                              className="px-2 py-0.5 text-[10px] border border-gray-300 rounded-xs text-gray-600"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveNotes(customer.id)}
                              className="px-2 py-0.5 text-[10px] bg-[#0f388a] text-white rounded-xs"
                            >
                              Save Notes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-gray-600">
                          {customer.fraudNotes ? (
                            <p className="italic bg-amber-50/50 p-1.5 rounded-xs border border-amber-200/50">
                              "{customer.fraudNotes}"
                            </p>
                          ) : (
                            <span className="text-gray-400 italic">No notes</span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNotesId(customer.id);
                              setTempNotes(customer.fraudNotes || '');
                            }}
                            className="text-[10px] text-[#0f388a] hover:underline block mt-0.5"
                          >
                            Edit note
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 text-right text-gray-400 text-[11px]">
                      {new Date(customer.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
