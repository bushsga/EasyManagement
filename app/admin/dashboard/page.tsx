"use client";

import { useEffect, useState } from "react";
import { Package, TrendingUp, AlertCircle, DollarSign } from "lucide-react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/lib/products";

interface DashboardStats {
  totalProducts: number;
  totalStockValue: number;
  todaySales: number;
  todayProfit: number;
  lowStockItems: number;
  lowStockProducts: Product[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalStockValue: 0,
    todaySales: 0,
    todayProfit: 0,
    lowStockItems: 0,
    lowStockProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      setLoading(true);

      try {
        // Get businessId from user document
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        const businessId = userData?.businessId;
        if (!businessId) return;

        // Fetch all products for this business
        const productsRef = collection(db, "products");
        const productsQuery = query(productsRef, where("businessId", "==", businessId));
        const productsSnapshot = await getDocs(productsQuery);
        const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];

        // Calculate total stock value (based on cost price)
        const totalStockValue = products.reduce((sum, p) => sum + (p.costPrice * p.currentQuantity), 0);

        // Low stock products
        const lowStockProducts = products.filter(p => p.currentQuantity <= p.lowStockLimit);
        const lowStockItems = lowStockProducts.length;

        // Fetch today's sales (from sales collection)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const salesRef = collection(db, "sales");
        const salesQuery = query(
          salesRef,
          where("businessId", "==", businessId),
          where("createdAt", ">=", Timestamp.fromDate(today)),
          where("createdAt", "<", Timestamp.fromDate(tomorrow))
        );
        const salesSnapshot = await getDocs(salesQuery);
        let todaySales = 0;
        let todayProfit = 0;
        salesSnapshot.forEach(doc => {
          const sale = doc.data();
          todaySales += sale.totalAmount || 0;
          todayProfit += sale.profit || 0;
        });

        setStats({
          totalProducts: products.length,
          totalStockValue,
          todaySales,
          todayProfit,
          lowStockItems,
          lowStockProducts,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-secondary-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-100">
          <div className="flex items-center justify-between mb-2">
            <Package className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-secondary-900">{stats.totalProducts}</span>
          </div>
          <p className="text-secondary-500 text-sm">Total Products</p>
          <p className="text-secondary-400 text-xs mt-1">Stock value: ₦{stats.totalStockValue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-100">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-secondary-900">₦{stats.todaySales.toLocaleString()}</span>
          </div>
          <p className="text-secondary-500 text-sm">Today's Sales</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-100">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-secondary-900">₦{stats.todayProfit.toLocaleString()}</span>
          </div>
          <p className="text-secondary-500 text-sm">Today's Profit</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-100">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <span className="text-2xl font-bold text-secondary-900">{stats.lowStockItems}</span>
          </div>
          <p className="text-secondary-500 text-sm">Low Stock Alerts</p>
        </div>
      </div>

      {/* Low Stock Alerts Section */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Low Stock Alerts</h2>
        {stats.lowStockItems === 0 ? (
          <p className="text-secondary-500">No low stock items. Good job!</p>
        ) : (
          <div className="space-y-3">
            {stats.lowStockProducts.map((product) => (
              <div key={product.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                <div>
                  <p className="font-medium text-secondary-900">{product.name}</p>
                  <p className="text-sm text-secondary-500">Remaining: {product.currentQuantity} {product.category === "Food" ? "units" : "pcs"}</p>
                </div>
                <button className="text-primary-600 text-sm hover:underline">Restock</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}