"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Calculator, TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react";
import toast from "react-hot-toast";

interface DailySummary {
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  itemsSold: number;
  transactionCount: number;
}

interface SaleItem {
  id: string;
  productName: string;
  quantitySold: number;
  totalAmount: number;
  profit: number;
  createdAt: Timestamp;
}

export default function StaffSummaryPage() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [todaySales, setTodaySales] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [businessId, setBusinessId] = useState("");
  const auth = getAuth();
  const user = auth.currentUser;

  // Fetch businessId
  useEffect(() => {
    const fetchBusinessId = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      if (userData) {
        setBusinessId(userData.businessId);
      }
    };
    fetchBusinessId();
  }, [user]);

  // Calculate today's summary
  const calculateTodaySummary = async () => {
    if (!businessId) return;
    setCalculating(true);

    try {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const salesRef = collection(db, "sales");
      const q = query(
        salesRef,
        where("businessId", "==", businessId),
        where("createdAt", ">=", Timestamp.fromDate(today)),
        where("createdAt", "<", Timestamp.fromDate(tomorrow))
      );
      const snapshot = await getDocs(q);
      const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SaleItem[];

      // Calculate totals
      const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0);
      const totalCost = totalSales - totalProfit;
      const itemsSold = sales.reduce((sum, s) => sum + s.quantitySold, 0);

      setSummary({
        totalSales,
        totalCost,
        totalProfit,
        itemsSold,
        transactionCount: sales.length,
      });
      setTodaySales(sales);

      if (sales.length === 0) {
        toast("No sales recorded today", { icon: "📭" });
      } else {
        toast.success(`Calculated! Total profit: ₦${totalProfit.toLocaleString()}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to calculate. Make sure Firebase indexes are created.");
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Daily Summary</h1>

      {/* Big Calculate Button */}
      <div className="mb-8">
        <button
          onClick={calculateTodaySummary}
          disabled={calculating}
          className="w-full md:w-auto bg-primary-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-3"
        >
          <Calculator className="h-6 w-6" />
          {calculating ? "Calculating..." : "Calculate Today's Profit"}
        </button>
        <p className="text-secondary-400 text-sm mt-2">Click to see today's total sales, cost, and profit</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Today's Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-100">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-secondary-900">₦{summary.totalSales.toLocaleString()}</span>
              </div>
              <p className="text-secondary-500 text-sm">Total Sales</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-100">
              <div className="flex items-center justify-between mb-2">
                <Package className="h-8 w-8 text-orange-600" />
                <span className="text-2xl font-bold text-secondary-900">₦{summary.totalCost.toLocaleString()}</span>
              </div>
              <p className="text-secondary-500 text-sm">Total Cost (Capital)</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-100">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-secondary-900">₦{summary.totalProfit.toLocaleString()}</span>
              </div>
              <p className="text-secondary-500 text-sm">Total Profit</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-100">
              <div className="flex items-center justify-between mb-2">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <span className="text-2xl font-bold text-secondary-900">{summary.itemsSold}</span>
              </div>
              <p className="text-secondary-500 text-sm">Items Sold</p>
            </div>
          </div>
        </div>
      )}

      {/* Today's Sales List */}
      {todaySales.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden">
          <h2 className="text-lg font-semibold text-secondary-900 p-6 pb-0">Today's Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Product</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Quantity</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Amount</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Profit</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Time</th>
                </tr>
              </thead>
              <tbody>
                {todaySales.map((sale) => (
                  <tr key={sale.id} className="border-b border-secondary-100">
                    <td className="px-6 py-4 text-secondary-900">{sale.productName}</td>
                    <td className="px-6 py-4 text-right text-secondary-600">{sale.quantitySold}</td>
                    <td className="px-6 py-4 text-right text-secondary-900">₦{sale.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-green-600">₦{sale.profit.toLocaleString()}</td>
                    <td className="px-6 py-4 text-secondary-500">{sale.createdAt?.toDate().toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {summary && todaySales.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-secondary-100">
          <p className="text-secondary-500">No sales recorded today.</p>
        </div>
      )}
    </div>
  );
}