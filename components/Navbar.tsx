import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-secondary-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">StockFlow</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-secondary-600 hover:text-primary-600 transition">
              Home
            </Link>
            <Link href="/about" className="text-secondary-600 hover:text-primary-600 transition">
              About
            </Link>
            <Link href="/contact" className="text-secondary-600 hover:text-primary-600 transition">
              Contact
            </Link>
            <Link href="/login" className="text-secondary-600 hover:text-primary-600 transition">
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}