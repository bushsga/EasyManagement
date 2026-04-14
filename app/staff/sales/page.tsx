"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Receipt, Package, DollarSign, TrendingUp } from "lucide-react";

interface SaleItem {
  id: string;
  productName: string;
  quantitySold: number;
  totalAmount: number;
  profit: number;
  createdAt: Timestamp;
}

export default function StaffSalesPage() {
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalProfit: 0,
    totalItems: 0,
  });
  
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      if (userData) {
        setBusinessId(userData.businessId);
        setStaffEmail(user.email || "");
      }
    };
    fetchUserData();
  }, [user]);

  const fetchTodaySales = async () => {
    if (!businessId || !staffEmail) return;
    setLoading(true);
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const salesRef = collection(db, "sales");
      const q = query(
        salesRef,
        where("businessId", "==", businessId),
        where("soldBy", "==", staffEmail),
        where("createdAt", ">=", Timestamp.fromDate(today)),
        where("createdAt", "<", Timestamp.fromDate(tomorrow))
      );
      const snapshot = await getDocs(q);
      const salesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SaleItem[];
      
      setSales(salesData);
      
      const totalSales = salesData.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalProfit = salesData.reduce((sum, s) => sum + s.profit, 0);
      const totalItems = salesData.reduce((sum, s) => sum + s.quantitySold, 0);
      
      setSummary({ totalSales, totalProfit, totalItems });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId && staffEmail) {
      fetchTodaySales();
    }
  }, [businessId, staffEmail]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate();
    return date.toLocaleTimeString();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Today's Sales</h1>
      
      {sales.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-secondary-100">
            <div className="flex items-center justify-between">
              <DollarSign className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold text-secondary-900">₦{summary.totalSales.toLocaleString()}</span>
            </div>
            <p className="text-secondary-500 text-sm mt-1">Your Sales</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-secondary-100">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-secondary-900">₦{summary.totalProfit.toLocaleString()}</span>
            </div>
            <p className="text-secondary-500 text-sm mt-1">Your Profit</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-secondary-100">
            <div className="flex items-center justify-between">
              <Package className="h-6 w-6 text-orange-600" />
              <span className="text-xl font-bold text-secondary-900">{summary.totalItems}</span>
            </div>
            <p className="text-secondary-500 text-sm mt-1">Items Sold</p>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-secondary-500">Loading your sales...</p>
        </div>
      ) : sales.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-secondary-100">
          <Receipt className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
          <p className="text-secondary-500">No sales recorded today.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
            {sales.map((sale) => (
              <div key={sale.id} className="bg-white rounded-xl shadow-sm border border-secondary-100 p-4">
                <h3 className="font-semibold text-secondary-900 mb-2">{sale.productName}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-secondary-500">Quantity:</span> <span className="text-secondary-900">{sale.quantitySold}</span></div>
                  <div><span className="text-secondary-500">Amount:</span> <span className="text-secondary-900">₦{sale.totalAmount.toLocaleString()}</span></div>
                  <div><span className="text-secondary-500">Profit:</span> <span className="text-green-600">₦{sale.profit.toLocaleString()}</span></div>
                  <div><span className="text-secondary-500">Time:</span> <span className="text-secondary-500">{formatTime(sale.createdAt)}</span></div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-secondary-100 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-secondary-50 border-b">
                <tr><th className="text-left px-6 py-3">Product</th><th className="text-right px-6 py-3">Quantity</th><th className="text-right px-6 py-3">Amount</th><th className="text-right px-6 py-3">Profit</th><th className="text-left px-6 py-3">Time</th></tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b">
                    <td className="px-6 py-4 font-medium">{sale.productName}</td>
                    <td className="px-6 py-4 text-right">{sale.quantitySold}</td>
                    <td className="px-6 py-4 text-right">₦{sale.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-green-600">₦{sale.profit.toLocaleString()}</td>
                    <td className="px-6 py-4 text-secondary-500">{formatTime(sale.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}