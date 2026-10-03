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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eae5de]">
        <div>
          <span className="text-[10px] tracking-widest text-[#b88b42] uppercase font-semibold">
            CRM & Profiles
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1a17]">
            Customer Directory (By Phone Number)
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
                <th className="p-3.5">Customer Details</th>
                <th className="p-3.5">Phone Number (Key)</th>
                <th className="p-3.5">Default Shipping Address</th>
                <th className="p-3.5">Orders Count</th>
                <th className="p-3.5">Total Spent</th>
                <th className="p-3.5 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece5]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No customers found. Customers are recorded automatically upon checkout.
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#faf8f5]/50 transition-colors">
                    <td className="p-3.5 font-medium text-gray-900">
                      {customer.name}
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
