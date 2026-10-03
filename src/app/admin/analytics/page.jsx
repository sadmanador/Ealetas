'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Eye, Flame, Compass, Loader2 } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error('Error fetching analytics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eae5de]">
        <div>
          <span className="text-[10px] tracking-widest text-[#b88b42] uppercase font-semibold">
            Customer Behavior & Traffic
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1a17]">
            Page Views & Product Popularity
          </h1>
        </div>

        <div className="p-3 bg-white border border-[#eae5de] rounded-xs shadow-xs text-xs">
          <span className="text-gray-500 uppercase tracking-wider block text-[10px]">
            Total Store Pageviews
          </span>
          <span className="text-xl font-serif font-semibold text-[#1c1a17]">
            {data?.totalViews || 0}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-[#b88b42] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products Visited */}
          <div className="bg-white border border-[#eae5de] rounded-xs shadow-xs p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#f0ece5]">
              <Flame className="w-4 h-4 text-[#b88b42]" />
              <h2 className="font-serif text-lg font-medium text-[#1c1a17]">
                Most Visited Jewelry Pieces
              </h2>
            </div>

            {data?.topProducts?.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">
                Product visits will appear here as customers browse the storefront.
              </p>
            ) : (
              <div className="divide-y divide-[#f0ece5] text-xs">
                {data?.topProducts?.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-gray-400 font-bold text-sm w-4">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="font-medium text-gray-900 block">{item.name}</span>
                        <span className="text-[11px] text-gray-500">
                          {item.category} • ৳{item.price?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 font-semibold text-[#b88b42] bg-[#fbf8f1] px-2.5 py-1 rounded-xs border border-[#eae5de]">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{item.views} visits</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Store Pages */}
          <div className="bg-white border border-[#eae5de] rounded-xs shadow-xs p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#f0ece5]">
              <Compass className="w-4 h-4 text-blue-600" />
              <h2 className="font-serif text-lg font-medium text-[#1c1a17]">
                Most Visited Store URLs & Pages
              </h2>
            </div>

            {data?.topPages?.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">
                Page views will populate here automatically.
              </p>
            ) : (
              <div className="divide-y divide-[#f0ece5] text-xs">
                {data?.topPages?.map((page, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-gray-400 font-bold text-sm w-4">
                        #{idx + 1}
                      </span>
                      <span className="font-mono text-gray-800 font-medium">{page.path}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-semibold text-gray-700 bg-gray-50 px-2.5 py-1 rounded-xs border border-gray-200">
                      <Eye className="w-3.5 h-3.5 text-gray-500" />
                      <span>{page.count} views</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
