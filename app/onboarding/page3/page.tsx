"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage3() {
  const router = useRouter();
  const [lowStockLimit, setLowStockLimit] = useState(5);
  const [currency, setCurrency] = useState("₦");

  const handleNext = () => {
    localStorage.setItem("onboarding_lowStockLimit", lowStockLimit.toString());
    localStorage.setItem("onboarding_currency", currency);
    router.push("/onboarding/page4");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary-900">Settings</h1>
          <p className="text-secondary-500 mt-2">Set your default preferences</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Low Stock Alert Threshold
            </label>
            <input
              type="number"
              value={lowStockLimit}
              onChange={(e) => setLowStockLimit(Number(e.target.value))}
              className="w-full border border-secondary-300 rounded-lg px-3 py-2"
              min="1"
            />
            <p className="text-secondary-400 text-xs mt-1">Alert when stock falls below this number</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full border border-secondary-300 rounded-lg px-3 py-2"
            >
              <option value="₦">₦ Naira</option>
              <option value="GH₵">GH₵ Cedi</option>
              <option value="$">$ Dollar</option>
              <option value="KES">KES Shilling</option>
            </select>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition mt-4"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}