"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getTodaySales } from "@/lib/sales";
import { Receipt, Clock } from "lucide-react";

interface SaleItem {
  id: string;
  productName: string;
  quantitySold: number;
  sellingPrice: number;
  totalAmount: number;
  createdAt: any;
}

export default function StaffSalesPage() {
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalToday, setTotalToday] = useState(0);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchSales = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const businessId = userDoc.data()?.businessId;
      if (!businessId) return;

      try {
        const todaySales = await getTodaySales(businessId);
        setSales(todaySales as SaleItem[]);
        const total = todaySales.reduce((sum, sale: any) => sum + sale.totalAmount, 0);
        setTotalToday(total);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, [user]);

  if (loading) {
    return <div className="text-center py-12 text-secondary-500">Loading sales...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Today's Sales</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-secondary-500 text-sm">Total Sales Today</p>
            <p className="text-3xl font-bold text-primary-600">₦{totalToday.toLocaleString()}</p>
          </div>
          <Receipt className="h-10 w-10 text-secondary-300" />
        </div>
      </div>

      {sales.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-12 text-center">
          <p className="text-secondary-500">No sales recorded today.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Product</th>
                <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Quantity</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Price</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Total</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Time</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-secondary-100">
                  <td className="px-6 py-4 font-medium text-secondary-900">{sale.productName}</td>
                  <td className="px-6 py-4 text-center text-secondary-600">{sale.quantitySold}</td>
                  <td className="px-6 py-4 text-right text-secondary-600">₦{sale.sellingPrice.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-medium text-secondary-900">₦{sale.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-secondary-500 text-sm">
                    {sale.createdAt?.toDate?.().toLocaleTimeString() || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}