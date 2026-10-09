'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

export default function HomeFaqSection({ faqs = [] }) {
  const [openIndex, setOpenIndex] = useState(0);

  if (!faqs || faqs.length === 0) {
    return null;
  }

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section id="faq" className="py-20 bg-gradient-to-b from-[#f8fbfe] via-[#ffffff] to-[#f8fbfe] border-t border-[#e2edf8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f6fd] border border-[#d2e2f6]">
            <Sparkles className="w-3.5 h-3.5 text-[#0f388a]" />
            <span className="text-[10px] tracking-[0.25em] text-[#0f388a] uppercase font-semibold">
              Frequently Asked Questions
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#0d2342] font-normal">
            Everything You Need to Know
          </h2>
          <p className="text-xs sm:text-sm text-[#5e7692] max-w-lg mx-auto">
            Questions regarding delivery zones, authentic gemstones, packaging, and cash on delivery.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.id || idx}
                className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 ${
                  isOpen
                    ? 'border-[#0f388a] shadow-md ring-1 ring-[#0f388a]/10'
                    : 'border-[#e4edf8] hover:border-[#b8d4f7]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 transition-colors"
                >
                  <span className="font-serif text-base sm:text-lg font-medium text-[#0d2342] leading-snug">
                    {item.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? 'bg-[#0f388a] text-white rotate-180'
                        : 'bg-[#f0f6fd] text-[#0f388a]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#4a617c] leading-relaxed border-t border-[#f0f6fd]">
                    <p className="whitespace-pre-line">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
