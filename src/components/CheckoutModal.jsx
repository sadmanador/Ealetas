'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { getDivisions, getDistricts, getUpazilas } from '@/lib/geo';
import { X, CheckCircle2, AlertCircle, Loader2, Sparkles, MapPin, Phone } from 'lucide-react';

export default function CheckoutModal() {
  const { isCheckoutOpen, setIsCheckoutOpen, items, subtotal, clearCart } = useCart();

  // Form Fields - Phone first!
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [upazila, setUpazila] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [isDhakaCityCorp, setIsDhakaCityCorp] = useState(true);
  const [notes, setNotes] = useState('');

  // Delivery charges from DB
  const [rates, setRates] = useState({ insideDhaka: 80, outsideDhaka: 120 });

  // Lookup & submission status
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [autofilledNotice, setAutofilledNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Cascading lists from bd-geo-address
  const divisions = getDivisions();
  const districts = getDistricts(division);
  const upazilas = getUpazilas(district);

  // Fetch delivery rates on mount
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.insideDhakaDeliveryCharge && data.outsideDhakaDeliveryCharge) {
          setRates({
            insideDhaka: Number(data.insideDhakaDeliveryCharge),
            outsideDhaka: Number(data.outsideDhakaDeliveryCharge),
          });
        }
      })
      .catch((e) => console.error(e));
  }, []);

  // Update district when division changes
  const handleDivisionChange = (newDiv) => {
    setDivision(newDiv);
    const newDistricts = getDistricts(newDiv);
    const firstDist = newDistricts.length > 0 ? newDistricts[0] : '';
    setDistrict(firstDist);
    const newUpazilas = getUpazilas(firstDist);
    setUpazila(newUpazilas.length > 0 ? newUpazilas[0] : '');

    if (newDiv !== 'Dhaka' || firstDist !== 'Dhaka') {
      setIsDhakaCityCorp(false);
    } else {
      setIsDhakaCityCorp(true);
    }
  };

  // Update upazila when district changes
  const handleDistrictChange = (newDist) => {
    setDistrict(newDist);
    const newUpazilas = getUpazilas(newDist);
    setUpazila(newUpazilas.length > 0 ? newUpazilas[0] : '');

    if (newDist !== 'Dhaka') {
      setIsDhakaCityCorp(false);
    } else {
      setIsDhakaCityCorp(true);
    }
  };

  // Customer phone lookup (debounced)
  useEffect(() => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setAutofilledNotice('');
      return;
    }

    const timer = setTimeout(async () => {
      setIsLookingUp(true);
      try {
        const res = await fetch(`/api/customer/lookup?phone=${encodeURIComponent(cleanPhone)}`);
        const data = await res.json();

        if (data.customer) {
          setName((prev) => (!prev ? data.customer.name : prev));
          if (data.customer.division) {
            setDivision(data.customer.division);
            const dists = getDistricts(data.customer.division);
            if (data.customer.district && dists.includes(data.customer.district)) {
              setDistrict(data.customer.district);
              const upz = getUpazilas(data.customer.district);
              if (data.customer.upazila && upz.includes(data.customer.upazila)) {
                setUpazila(data.customer.upazila);
              }
            }
          }
          if (data.customer.fullAddress) {
            setFullAddress(data.customer.fullAddress);
          }
          setAutofilledNotice(`Welcome back, ${data.customer.name}! We've prefilled your details.`);
        }
      } catch (err) {
        console.error('Customer lookup error:', err);
      } finally {
        setIsLookingUp(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [phone]);

  const deliveryCharge = isDhakaCityCorp ? rates.insideDhaka : rates.outsideDhaka;
  const totalPayable = subtotal + deliveryCharge;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!phone || phone.trim().length < 11) {
      setErrorMessage('Please enter a valid 11-digit Bangladeshi mobile number.');
      return;
    }
    if (!name || !fullAddress) {
      setErrorMessage('Please provide your full name and delivery street/house address.');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('Your bag is empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        phone: phone.trim(),
        name: name.trim(),
        division,
        district,
        upazila,
        fullAddress: fullAddress.trim(),
        isDhakaCityCorp,
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        notes,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order');
      }

      setOrderSuccess(data.order);
      clearCart();
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong while placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCheckoutOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-[#eae5de] rounded-sm shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eae5de] bg-[#faf8f5]">
          <div>
            <span className="text-[10px] tracking-widest text-[#b88b42] uppercase font-semibold">
              EALETAS FINE JEWELRY
            </span>
            <h2 className="font-serif text-xl font-medium text-[#1c1a17]">
              {orderSuccess ? 'Order Confirmation' : 'Complete Your Order'}
            </h2>
          </div>
          <button
            onClick={() => {
              setIsCheckoutOpen(false);
              setOrderSuccess(null);
            }}
            className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {orderSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-serif text-2xl font-medium text-[#1c1a17]">
              Thank You For Your Order!
            </h3>
            <p className="text-sm text-[#6b665f] max-w-md mx-auto">
              Your order <span className="font-semibold text-[#1c1a17]">#{orderSuccess.orderNumber}</span> has been received. Our concierge will contact you shortly to confirm delivery.
            </p>
            <div className="p-4 bg-[#faf8f5] border border-[#eae5de] rounded-sm text-left max-w-md mx-auto text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Total:</span>
                <span className="font-semibold text-gray-900">৳{orderSuccess.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Status:</span>
                <span className="font-semibold uppercase tracking-wider text-amber-700">{orderSuccess.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment:</span>
                <span className="font-semibold text-gray-900">Cash on Delivery</span>
              </div>
            </div>
            <button
              onClick={() => {
                setIsCheckoutOpen(false);
                setOrderSuccess(null);
              }}
              className="mt-4 px-6 py-2.5 bg-[#1c1a17] text-white text-xs uppercase tracking-widest hover:bg-[#b88b42] transition-colors rounded-sm"
            >
              Continue Browsing
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-5">
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Phone Number Taken First */}
            <div className="space-y-1.5 p-4 bg-[#fbf9f6] border border-[#ebdcc7] rounded-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#1c1a17] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#b88b42]" />
                  Mobile Number (Required First) *
                </label>
                {isLookingUp && (
                  <span className="text-[11px] text-[#b88b42] flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Looking up profile...
                  </span>
                )}
              </div>
              <input
                type="tel"
                required
                placeholder="e.g. 017XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#dcd5cb] text-sm rounded-sm focus:outline-none focus:border-[#b88b42]"
              />
              <p className="text-[11px] text-[#8e8880]">
                Enter your phone number first. If you have ordered before, your address will be automatically populated!
              </p>

              {autofilledNotice && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-sm border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{autofilledNotice}</span>
                </div>
              )}
            </div>

            {/* 2. Customer Name */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-[#1c1a17] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#dcd5cb] text-sm rounded-sm focus:outline-none focus:border-[#b88b42]"
              />
            </div>

            {/* 3. Address via bd-geo-address */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium text-[#1c1a17]">
                <MapPin className="w-3.5 h-3.5 text-[#b88b42]" />
                Delivery Address (bd-geo-address) *
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Division */}
                <div>
                  <label className="block text-[11px] text-[#6b665f] mb-1">Division</label>
                  <select
                    value={division}
                    onChange={(e) => handleDivisionChange(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-[#dcd5cb] text-xs rounded-sm focus:outline-none focus:border-[#b88b42]"
                  >
                    {divisions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="block text-[11px] text-[#6b665f] mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-[#dcd5cb] text-xs rounded-sm focus:outline-none focus:border-[#b88b42]"
                  >
                    {districts.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upazila / Thana */}
                <div>
                  <label className="block text-[11px] text-[#6b665f] mb-1">Upazila / Area</label>
                  <select
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-[#dcd5cb] text-xs rounded-sm focus:outline-none focus:border-[#b88b42]"
                  >
                    {upazilas.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Detailed Street Address */}
              <div>
                <label className="block text-[11px] text-[#6b665f] mb-1">
                  Street, House, Flat & Landmark *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="House #, Road #, Sector/Area, Landmark..."
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#dcd5cb] text-xs rounded-sm focus:outline-none focus:border-[#b88b42]"
                />
              </div>
            </div>

            {/* 4. Delivery Area Selection & Charges */}
            <div className="p-3.5 bg-[#faf8f5] border border-[#eae5de] rounded-sm space-y-2">
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#1c1a17]">
                Delivery Zone & Fee
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label
                  className={`flex items-center gap-2 p-2.5 border rounded-sm cursor-pointer transition-all ${
                    isDhakaCityCorp
                      ? 'border-[#b88b42] bg-[#fdfaf5] font-medium text-[#1c1a17]'
                      : 'border-[#eae5de] bg-white text-[#6b665f]'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryZone"
                    checked={isDhakaCityCorp}
                    onChange={() => setIsDhakaCityCorp(true)}
                    className="accent-[#b88b42]"
                  />
                  <span>Inside Dhaka City Corp (North & South)</span>
                  <span className="ml-auto font-semibold text-[#b88b42]">৳{rates.insideDhaka}</span>
                </label>

                <label
                  className={`flex items-center gap-2 p-2.5 border rounded-sm cursor-pointer transition-all ${
                    !isDhakaCityCorp
                      ? 'border-[#b88b42] bg-[#fdfaf5] font-medium text-[#1c1a17]'
                      : 'border-[#eae5de] bg-white text-[#6b665f]'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryZone"
                    checked={!isDhakaCityCorp}
                    onChange={() => setIsDhakaCityCorp(false)}
                    className="accent-[#b88b42]"
                  />
                  <span>Outside Dhaka / Suburbs</span>
                  <span className="ml-auto font-semibold text-[#b88b42]">৳{rates.outsideDhaka}</span>
                </label>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-[11px] text-[#6b665f] mb-1">
                Order Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="Gift note, delivery timing preferences..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#dcd5cb] text-xs rounded-sm focus:outline-none focus:border-[#b88b42]"
              />
            </div>

            {/* Pricing Summary */}
            <div className="pt-3 border-t border-[#eae5de] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#6b665f]">
                <span>Items Subtotal ({items.length}):</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#6b665f]">
                <span>
                  Delivery Charge ({isDhakaCityCorp ? 'Inside Dhaka City' : 'Outside Dhaka'}):
                </span>
                <span className="font-medium text-[#1c1a17]">৳{deliveryCharge}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[#1c1a17] pt-2 border-t border-dashed border-[#eae5de]">
                <span>Total Payable (Cash on Delivery):</span>
                <span className="text-[#b88b42] text-base">৳{totalPayable.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="px-4 py-2 border border-[#dcd5cb] text-xs uppercase tracking-wider text-[#6b665f] hover:bg-[#faf8f5] rounded-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1c1a17] text-white text-xs uppercase tracking-widest font-medium hover:bg-[#b88b42] transition-colors rounded-sm shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Placing Order...
                  </>
                ) : (
                  `Confirm Order • ৳${totalPayable.toLocaleString()}`
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
