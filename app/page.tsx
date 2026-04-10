import Link from "next/link";
import { Package, TrendingUp, Bell, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4 flex-grow">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-secondary-900 mb-6">
            Smart Inventory & <br />
            <span className="text-primary-600">Profit Tracking</span>
          </h1>
          <p className="text-xl text-secondary-500 max-w-2xl mx-auto mb-10">
            Stop using pen and paper. Track stock, record sales, and know your
            daily profit — all in one simple app.
          </p>
          <Link
            href="/signup"
            className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition inline-block"
          >
            Start Free Trial
          </Link>
          <p className="text-secondary-400 text-sm mt-4">
            No credit card required • 2 months free
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-secondary-900 mb-12">
            Everything you need
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-100">
              <Package className="h-10 w-10 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Stock Management
              </h3>
              <p className="text-secondary-500">
                Add products, set prices, and track quantities with ease.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-100">
              <TrendingUp className="h-10 w-10 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Profit Calculation
              </h3>
              <p className="text-secondary-500">
                Know your capital, profit, and loss with one click.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-100">
              <Bell className="h-10 w-10 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Low Stock Alerts
              </h3>
              <p className="text-secondary-500">
                Get notified before you run out of products.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-100">
              <Users className="h-10 w-10 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Staff Access
              </h3>
              <p className="text-secondary-500">
                Staff can record sales without touching your data.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}