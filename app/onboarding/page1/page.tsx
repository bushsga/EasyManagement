"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage1() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [ownerName, setOwnerName] = useState("");

  const handleNext = () => {
    // Save to localStorage or context for now
    // Later we'll save to Firestore
    localStorage.setItem("onboarding_businessName", businessName);
    localStorage.setItem("onboarding_businessType", businessType);
    localStorage.setItem("onboarding_ownerName", ownerName);
    router.push("/onboarding/page2");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary-900">Business Info</h1>
          <p className="text-secondary-500 mt-2">Tell us about your business</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Mike's Supermarket"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Business Type
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select type</option>
              <option value="supermarket">Supermarket</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="restaurant">Restaurant</option>
              <option value="fashion">Fashion Store</option>
              <option value="electronics">Electronics</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Owner Name
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="John Doe"
              required
            />
          </div>

          <button
            onClick={handleNext}
            disabled={!businessName || !businessType || !ownerName}
            className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 mt-4"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}