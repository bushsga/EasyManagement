"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAllSales, getSalesSummary, exportSalesToCSV, Sale } from "@/lib/sales";
import { Download, Search, DollarSign, Package, TrendingUp, Receipt, Edit } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState("");
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "custom">("today");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalProfit: 0,
    totalCost: 0,
    totalItems: 0,
    transactionCount: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  
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

  // Get date range based on selection
  const getDateRange = () => {
    const now = new Date();
    const start = new Date();
    const end = new Date();
    
    switch (dateRange) {
      case "today":
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "week":
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "month":
        start.setMonth(now.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          return {
            start: new Date(customStartDate),
            end: new Date(customEndDate),
          };
        }
        return null;
    }
    return { start, end };
  };

  // Fetch sales
  const fetchSales = async () => {
    if (!businessId) return;
    setLoading(true);
    
    try {
      const range = getDateRange();
      if (!range && dateRange === "custom") {
        setLoading(false);
        return;
      }
      
      const salesData = await getAllSales(businessId, range?.start, range?.end);
      setSales(salesData);
      
      if (range) {
        const summaryData = await getSalesSummary(businessId, range.start, range.end);
        setSummary(summaryData);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchSales();
    }
  }, [businessId, dateRange, customStartDate, customEndDate]);

  // Filter sales by search term
  const filteredSales = sales.filter(sale =>
    sale.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate();
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Handle export
  const handleExport = async () => {
    const range = getDateRange();
    if (range && businessId) {
      await exportSalesToCSV(businessId, range.start, range.end);
      toast.success("Export complete");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Sales History</h1>

      {/* Date Filter Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-end">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Date Range</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDateRange("today")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  dateRange === "today"
                    ? "bg-primary-600 text-white"
                    : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateRange("week")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  dateRange === "week"
                    ? "bg-primary-600 text-white"
                    : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setDateRange("month")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  dateRange === "month"
                    ? "bg-primary-600 text-white"
                    : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setDateRange("custom")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  dateRange === "custom"
                    ? "bg-primary-600 text-white"
                    : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {dateRange === "custom" && (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="border border-secondary-300 rounded-lg px-3 py-2 w-full sm:w-auto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="border border-secondary-300 rounded-lg px-3 py-2 w-full sm:w-auto"
                />
              </div>
            </div>
          )}

          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-sm font-medium text-secondary-700 mb-1">Search Product</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by product name..."
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg"
              />
            </div>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-secondary-100 text-secondary-700 px-4 py-2 rounded-lg hover:bg-secondary-200 transition w-full sm:w-auto justify-center"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary.transactionCount > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
          <div className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-secondary-100">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <DollarSign className="h-5 w-5 sm:h-8 sm:w-8 text-green-600" />
              <span className="text-base sm:text-2xl font-bold text-secondary-900">₦{summary.totalSales.toLocaleString()}</span>
            </div>
            <p className="text-secondary-500 text-xs sm:text-sm">Total Sales</p>
          </div>

          <div className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-secondary-100">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <Receipt className="h-5 w-5 sm:h-8 sm:w-8 text-orange-600" />
              <span className="text-base sm:text-2xl font-bold text-secondary-900">₦{summary.totalCost.toLocaleString()}</span>
            </div>
            <p className="text-secondary-500 text-xs sm:text-sm">Total Cost</p>
          </div>

          <div className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-secondary-100">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <TrendingUp className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600" />
              <span className="text-base sm:text-2xl font-bold text-secondary-900">₦{summary.totalProfit.toLocaleString()}</span>
            </div>
            <p className="text-secondary-500 text-xs sm:text-sm">Total Profit</p>
          </div>

          <div className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-secondary-100">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <Package className="h-5 w-5 sm:h-8 sm:w-8 text-purple-600" />
              <span className="text-base sm:text-2xl font-bold text-secondary-900">{summary.totalItems}</span>
            </div>
            <p className="text-secondary-500 text-xs sm:text-sm">Items Sold</p>
          </div>
        </div>
      )}

      {/* Sales Display */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-secondary-500">Loading sales...</p>
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-secondary-100">
          <p className="text-secondary-500">No sales found for this period.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
            {filteredSales.map((sale) => (
              <div key={sale.id} className="bg-white rounded-xl shadow-sm border border-secondary-100 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-secondary-900 text-base">{sale.productName}</h3>
                    <p className="text-xs text-secondary-500 mt-1">{sale.soldBy?.split("@")[0] || "N/A"}</p>
                  </div>
                  <Link href={`/admin/sales/${sale.id}`}>
                    <button className="text-primary-600 p-1">
                      <Edit className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <span className="text-secondary-500">Quantity:</span>
                    <span className="ml-2 text-secondary-900">{sale.quantitySold}</span>
                  </div>
                  <div>
                    <span className="text-secondary-500">Selling Price:</span>
                    <span className="ml-2 text-secondary-900">₦{sale.sellingPrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-secondary-500">Amount:</span>
                    <span className="ml-2 text-secondary-900 font-medium">₦{sale.totalAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-secondary-500">Profit:</span>
                    <span className="ml-2 text-green-600 font-medium">₦{sale.profit.toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-xs text-secondary-400">{formatDate(sale.createdAt)}</p>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-secondary-100 overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Product</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Quantity</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Selling Price</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Total Amount</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Profit</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Sold By</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Date/Time</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                    <td className="px-6 py-4 font-medium text-secondary-900">{sale.productName}</td>
                    <td className="px-6 py-4 text-right text-secondary-600">{sale.quantitySold}</td>
                    <td className="px-6 py-4 text-right text-secondary-600">₦{sale.sellingPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-secondary-900">₦{sale.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-green-600">₦{sale.profit.toLocaleString()}</td>
                    <td className="px-6 py-4 text-secondary-500">{sale.soldBy?.split("@")[0] || "N/A"}</td>
                    <td className="px-6 py-4 text-secondary-500 text-sm">{formatDate(sale.createdAt)}</td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/admin/sales/${sale.id}`}>
                        <button className="text-primary-600 hover:text-primary-700">
                          <Edit className="h-4 w-4" />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-secondary-50 border-t border-secondary-200">
                <tr>
                  <td className="px-6 py-4 font-semibold text-secondary-900">Total</td>
                  <td className="px-6 py-4 text-right font-semibold text-secondary-900">{summary.totalItems}</td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4 text-right font-semibold text-secondary-900">₦{summary.totalSales.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-semibold text-green-600">₦{summary.totalProfit.toLocaleString()}</td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}