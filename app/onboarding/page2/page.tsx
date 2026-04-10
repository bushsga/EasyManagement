"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage2() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleNext = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    localStorage.setItem("onboarding_adminEmail", email);
    localStorage.setItem("onboarding_adminPassword", password);
    router.push("/onboarding/page3");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary-900">Admin Account</h1>
          <p className="text-secondary-500 mt-2">Create your admin login</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-secondary-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-secondary-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-secondary-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <button
            onClick={handleNext}
            disabled={!email || !password || !confirmPassword}
            className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 mt-4"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}