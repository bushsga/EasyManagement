"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LogOut, ShoppingCart, Receipt, Calculator } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Sell Product", href: "/staff/sell", icon: ShoppingCart },
  { name: "Today's Sales", href: "/staff/sales", icon: Receipt },
  { name: "Daily Summary", href: "/staff/summary", icon: Calculator },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-secondary-50">
      <aside className="w-64 bg-white border-r border-secondary-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-600">StockFlow</h1>
          <p className="text-sm text-secondary-500 mt-1">Staff Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-primary-50 text-primary-600"
                    : "text-secondary-600 hover:bg-secondary-100"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-secondary-200">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}