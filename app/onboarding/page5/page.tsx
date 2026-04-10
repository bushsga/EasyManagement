"use client";

import { useRouter } from "next/navigation";

export default function OnboardingPage5() {
  const router = useRouter();

  const handleComplete = () => {
    // In the future, save all onboarding data to Firestore here
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900">Setup Complete!</h1>
          <p className="text-secondary-500 mt-2">Your business is ready to go</p>
        </div>

        <button
          onClick={handleComplete}
          className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}