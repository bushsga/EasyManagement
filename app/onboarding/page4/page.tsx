"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage4() {
  const router = useRouter();
  const [staffEmail, setStaffEmail] = useState("");
  const [skip, setSkip] = useState(false);

  const handleNext = () => {
    if (staffEmail && !skip) {
      localStorage.setItem("onboarding_staffEmail", staffEmail);
    }
    router.push("/onboarding/page5");
  };

  const handleSkip = () => {
    setSkip(true);
    router.push("/onboarding/page5");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary-900">Add Staff (Optional)</h1>
          <p className="text-secondary-500 mt-2">You can add staff later from dashboard</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Staff Email
            </label>
            <input
              type="email"
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              className="w-full border border-secondary-300 rounded-lg px-3 py-2"
              placeholder="staff@example.com"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleNext}
              disabled={!staffEmail}
              className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={handleSkip}
              className="flex-1 bg-secondary-200 text-secondary-700 py-2 rounded-lg font-semibold hover:bg-secondary-300 transition"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}