"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import Link from "next/link";
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAllSales, getSalesSummary, Sale, } from "@/lib/sales";
import { getProducts } from "@/lib/products";
import { Download, TrendingUp, Package, DollarSign, Calendar, Star } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState("");
  const [dateRange, setDateRange] = useState<"week" | "month" | "year">("week");
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalProfit: 0,
    totalCost: 0,
    totalItems: 0,
    transactionCount: 0,
  });
  const [topProducts, setTopProducts] = useState<{ name: string; quantity: number; revenue: number }[]>([]);
  const [stockValue, setStockValue] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  
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

  // Get date range
  const getDateRange = () => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    switch (dateRange) {
      case "week":
        start.setDate(end.getDate() - 7);
        break;
      case "month":
        start.setMonth(end.getMonth() - 1);
        break;
      case "year":
        start.setFullYear(end.getFullYear() - 1);
        break;
    }
    return { start, end };
  };

  // Fetch all report data
  const fetchReports = async () => {
    if (!businessId) return;
    setLoading(true);
    
    try {
      const range = getDateRange();
      const salesData = await getAllSales(businessId, range.start, range.end);
      const summaryData = await getSalesSummary(businessId, range.start, range.end);
      setSummary(summaryData);
      
      // Calculate top products
      const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
      salesData.forEach((sale: Sale) => {
        if (productSales[sale.productId]) {
          productSales[sale.productId].quantity += sale.quantitySold;
          productSales[sale.productId].revenue += sale.totalAmount;
        } else {
          productSales[sale.productId] = {
            name: sale.productName,
            quantity: sale.quantitySold,
            revenue: sale.totalAmount,
          };
        }
      });
      
      const top5 = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
      setTopProducts(top5);
      
      // Get products for stock value
      const products = await getProducts(businessId);
      const totalStockValue = products.reduce((sum, p) => sum + (p.costPrice * p.currentQuantity), 0);
      setStockValue(totalStockValue);
      
      const lowStock = products.filter(p => p.currentQuantity <= p.lowStockLimit).length;
      setLowStockCount(lowStock);
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchReports();
    }
  }, [businessId, dateRange]);

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Reports</h1>
      
      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-secondary-500" />
            <span className="text-secondary-700 font-medium">Report Period:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setDateRange("week")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                dateRange === "week"
                  ? "bg-primary-600 text-white"
                  : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange("month")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                dateRange === "month"
                  ? "bg-primary-600 text-white"
                  : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateRange("year")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                dateRange === "year"
                  ? "bg-primary-600 text-white"
                  : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
              }`}
            >
              Last 12 Months
            </button>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-secondary-100">
          <div className="flex items-center justify-between mb-1">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-xl font-bold text-secondary-900">{formatCurrency(summary.totalSales)}</span>
          </div>
          <p className="text-secondary-500 text-sm">Total Sales</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-secondary-100">
          <div className="flex items-center justify-between mb-1">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-xl font-bold text-secondary-900">{formatCurrency(summary.totalProfit)}</span>
          </div>
          <p className="text-secondary-500 text-sm">Total Profit</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-secondary-100">
          <div className="flex items-center justify-between mb-1">
            <Package className="h-5 w-5 text-orange-600" />
            <span className="text-xl font-bold text-secondary-900">{formatCurrency(stockValue)}</span>
          </div>
          <p className="text-secondary-500 text-sm">Stock Value</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-secondary-100">
          <div className="flex items-center justify-between mb-1">
            <Star className="h-5 w-5 text-purple-600" />
            <span className="text-xl font-bold text-secondary-900">{summary.transactionCount}</span>
          </div>
          <p className="text-secondary-500 text-sm">Transactions ({summary.totalItems} items)</p>
        </div>
      </div>
      
      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600 text-lg">⚠️</span>
            <p className="text-yellow-700">
              <span className="font-semibold">{lowStockCount}</span> products are running low on stock. 
              Go to <Link href="/admin/products" className="underline">Products</Link> to restock.
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Top Selling Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-secondary-500 text-center py-8">No sales data available</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex justify-between items-center pb-3 border-b border-secondary-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary-600">#{index + 1}</span>
                      <span className="font-medium text-secondary-900">{product.name}</span>
                    </div>
                    <p className="text-xs text-secondary-500 mt-1">{product.quantity} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-secondary-900">{formatCurrency(product.revenue)}</p>
                    <p className="text-xs text-secondary-400">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Profit Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Profit Analysis</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-secondary-100">
              <span className="text-secondary-600">Total Revenue</span>
              <span className="font-semibold text-secondary-900">{formatCurrency(summary.totalSales)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-secondary-100">
              <span className="text-secondary-600">Total Cost</span>
              <span className="font-semibold text-secondary-900">{formatCurrency(summary.totalCost)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-secondary-100">
              <span className="text-secondary-600">Gross Profit</span>
              <span className="font-semibold text-green-600">{formatCurrency(summary.totalProfit)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-secondary-600">Profit Margin</span>
              <span className="font-semibold text-primary-600">
                {summary.totalSales > 0 ? ((summary.totalProfit / summary.totalSales) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
          
          {/* Profit Meter */}
          <div className="mt-6">
            <div className="h-2 bg-secondary-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${summary.totalSales > 0 ? (summary.totalProfit / summary.totalSales) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-secondary-400 text-center mt-2">Profit margin percentage</p>
          </div>
        </div>
      </div>
      
      {/* Business Health Tips */}
      <div className="mt-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4 border border-primary-100">
        <h3 className="font-semibold text-primary-800 mb-2">📊 Business Insights</h3>
        <ul className="text-sm text-secondary-700 space-y-1">
          {summary.totalProfit < 10000 && (
            <li>• Your profit is currently low. Consider reviewing your pricing strategy.</li>
          )}
          {lowStockCount > 0 && (
            <li>• You have {lowStockCount} products with low stock. Restock soon to avoid lost sales.</li>
          )}
          {topProducts.length > 0 && summary.totalSales > 0 && (
            <li>• Your top product "{topProducts[0]?.name}" generated {formatCurrency(topProducts[0]?.revenue || 0)} in revenue.</li>
          )}
          {summary.totalProfit > 50000 && (
            <li>• Great job! Your business is performing well. Keep it up! 🎉</li>
          )}
        </ul>
      </div>
    </div>
  );
}