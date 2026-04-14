import Link from "next/link";
import { Package, TrendingUp, Bell, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar - Responsive */}
      <nav className="border-b border-secondary-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <span className="text-xl sm:text-2xl font-bold text-primary-600">EasyManagement</span>
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/login" className="text-secondary-600 hover:text-primary-600 text-sm sm:text-base">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-primary-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base hover:bg-primary-700 transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-secondary-900 mb-4 sm:mb-6">
            Smart Inventory & <br />
            <span className="text-primary-600">Profit Tracking</span>
          </h1>
          <p className="text-base sm:text-xl text-secondary-500 max-w-2xl mx-auto mb-6 sm:mb-10 px-2">
            Stop using pen and paper. Track stock, record sales, and know your daily profit — all in one simple app.
          </p>
          <Link
            href="/signup"
            className="bg-primary-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-primary-700 transition inline-block"
          >
            Start Free Trial
          </Link>
          <p className="text-secondary-400 text-xs sm:text-sm mt-4">
            No credit card required • 2 months free
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-secondary-900 mb-8 sm:mb-12">
            Everything you need
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-secondary-100">
              <Package className="h-8 w-8 sm:h-10 sm:w-10 text-primary-600 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-secondary-900 mb-2">Stock Management</h3>
              <p className="text-sm sm:text-base text-secondary-500">Add products, set prices, and track quantities with ease.</p>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-secondary-100">
              <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-primary-600 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-secondary-900 mb-2">Profit Calculation</h3>
              <p className="text-sm sm:text-base text-secondary-500">Know your capital, profit, and loss with one click.</p>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-secondary-100">
              <Bell className="h-8 w-8 sm:h-10 sm:w-10 text-primary-600 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-secondary-900 mb-2">Low Stock Alerts</h3>
              <p className="text-sm sm:text-base text-secondary-500">Get notified before you run out of products.</p>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-secondary-100">
              <Users className="h-8 w-8 sm:h-10 sm:w-10 text-primary-600 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-secondary-900 mb-2">Staff Access</h3>
              <p className="text-sm sm:text-base text-secondary-500">Staff can record sales without touching your data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-secondary-300 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm sm:text-base">&copy; 2026 EasyManagement. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}