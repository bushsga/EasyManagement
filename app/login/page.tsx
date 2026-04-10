"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Admin login (email/password)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (!userData || userData.role !== "admin") {
        setError("You are not registered as admin.");
        return;
      }
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // Staff login (Google only)
  const handleStaffGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email;

      if (!email) throw new Error("No email from Google");

      // Look up staff by email in Firestore (using email as document ID)
      const userDoc = await getDoc(doc(db, "users", email));
      const userData = userDoc.data();

      if (!userData || userData.role !== "staff") {
        setError("You are not registered as staff. Ask admin to add your email.");
        await auth.signOut();
        return;
      }

      router.push("/staff/sell");
    } catch (error: any) {
      setError(error.message || "Google sign-in failed");
      await auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-secondary-900">Welcome Back</h1>
          <p className="text-secondary-500 mt-2">Login to your account</p>
        </div>

        {/* Role Toggle */}
        <div className="flex gap-4 mb-6 bg-secondary-100 p-1 rounded-lg">
          <button
            onClick={() => setRole("admin")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              role === "admin"
                ? "bg-primary-600 text-white"
                : "text-secondary-600 hover:text-primary-600"
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setRole("staff")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              role === "staff"
                ? "bg-primary-600 text-white"
                : "text-secondary-600 hover:text-primary-600"
            }`}
          >
            Staff
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {role === "admin" ? (
          <form onSubmit={handleAdminLogin} className="space-y-5">
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
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <p className="text-center text-sm text-secondary-500 mt-4">
              Don't have an account? <Link href="/signup" className="text-primary-600">Sign up</Link>
            </p>
          </form>
        ) : (
          <div className="space-y-4">
<button
  onClick={handleStaffGoogleSignIn}
  disabled={loading}
  className="w-full flex items-center justify-center gap-3 bg-white border border-secondary-300 text-secondary-700 py-2 rounded-lg font-semibold hover:bg-secondary-50 transition disabled:opacity-50"
>
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
  {loading ? "Signing in..." : "Sign in with Google"}
</button>
            <p className="text-center text-xs text-secondary-400">
              Use your Google account (Gmail) that admin has added.
            </p>
            <p className="text-center text-xs text-secondary-400">
              No password needed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}