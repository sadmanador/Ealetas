'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMessage(res.error || 'Invalid credentials.');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (accNum) => {
    if (accNum === 1) {
      setEmail('admin1@ealetas.com');
      setPassword('Admin1234!');
    } else {
      setEmail('admin2@ealetas.com');
      setPassword('Admin1234!');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-[#eae5de] rounded-sm shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <span className="font-serif text-3xl tracking-[0.25em] font-medium text-[#1c1a17]">
              EALETAS
            </span>
            <span className="block text-[8px] tracking-[0.4em] text-[#b88b42] uppercase">
              FINE JEWELRY ATELIER
            </span>
          </Link>
          <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-[#6b665f]">
            <ShieldCheck className="w-4 h-4 text-[#b88b42]" />
            <span>Admin Authentication</span>
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-[#1c1a17] mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ealetas.com"
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#dcd5cb] text-sm rounded-sm focus:outline-none focus:border-[#b88b42]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-[#1c1a17] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#dcd5cb] text-sm rounded-sm focus:outline-none focus:border-[#b88b42]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#1c1a17] text-white text-xs uppercase tracking-widest font-medium hover:bg-[#b88b42] transition-colors rounded-sm shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
              </>
            ) : (
              'Enter Admin Atelier'
            )}
          </button>
        </form>

        {/* Seeded Accounts Helper */}
        <div className="pt-4 border-t border-[#f0ece5] space-y-2">
          <span className="text-[11px] font-semibold text-[#8e8880] uppercase tracking-wider block text-center">
            2 Seeded Admin Accounts Ready:
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickFill(1)}
              className="p-2 border border-[#eae5de] bg-[#faf8f5] hover:border-[#b88b42] rounded-xs text-left transition-colors"
            >
              <div className="font-semibold text-gray-800">Admin 1 (Curator)</div>
              <div className="text-gray-500 text-[10px]">admin1@ealetas.com</div>
              <div className="text-[#b88b42] text-[10px] mt-0.5">Click to Fill</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill(2)}
              className="p-2 border border-[#eae5de] bg-[#faf8f5] hover:border-[#b88b42] rounded-xs text-left transition-colors"
            >
              <div className="font-semibold text-gray-800">Admin 2 (Logistics)</div>
              <div className="text-gray-500 text-[10px]">admin2@ealetas.com</div>
              <div className="text-[#b88b42] text-[10px] mt-0.5">Click to Fill</div>
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link href="/" className="text-xs text-[#b88b42] hover:underline">
            ← Back to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
