import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { Product } from "./products";

export interface Sale {
  id?: string;
  productId: string;
  productName: string;
  quantitySold: number;
  sellingPrice: number;
  totalAmount: number;
  profit: number;
  soldBy: string;
  businessId: string;
  createdAt: Timestamp;
}

// Record a sale and update product stock
export async function recordSale(
  product: Product,
  quantitySold: number,
  soldBy: string,
  businessId: string
) {
  if (!product.id) throw new Error("Product ID missing");

  // Check if enough stock
  if (product.currentQuantity < quantitySold) {
    throw new Error(`Insufficient stock. Only ${product.currentQuantity} left.`);
  }

  const sellingPrice = product.sellingPrice;
  const costPrice = product.costPrice;
  const totalAmount = sellingPrice * quantitySold;
  const profit = (sellingPrice - costPrice) * quantitySold;

  // 1. Update product stock
  const newQuantity = product.currentQuantity - quantitySold;
  const productRef = doc(db, "products", product.id);
  await updateDoc(productRef, {
    currentQuantity: newQuantity,
  });

  // 2. Create sale record
  const saleData: Omit<Sale, "id"> = {
    productId: product.id,
    productName: product.name,
    quantitySold,
    sellingPrice,
    totalAmount,
    profit,
    soldBy,
    businessId,
    createdAt: Timestamp.now(),
  };
  const salesRef = collection(db, "sales");
  const docRef = await addDoc(salesRef, saleData);

  return { saleId: docRef.id, newQuantity };
}

// Get today's sales for a business
export async function getTodaySales(businessId: string) {
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
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Sale[];
}

// Get sales for a specific date range
export async function getSalesByDateRange(businessId: string, startDate: Date, endDate: Date) {
  const salesRef = collection(db, "sales");
  const q = query(
    salesRef,
    where("businessId", "==", businessId),
    where("createdAt", ">=", Timestamp.fromDate(startDate)),
    where("createdAt", "<=", Timestamp.fromDate(endDate))
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Sale[];
}

// Calculate profit summary for a business (today, week, month)
export async function getProfitSummary(businessId: string, days: number = 1) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const sales = await getSalesByDateRange(businessId, startDate, endDate);
  const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0);
  const totalCost = totalSales - totalProfit;
  const itemsSold = sales.reduce((sum, s) => sum + s.quantitySold, 0);

  return {
    totalSales,
    totalProfit,
    totalCost,
    itemsSold,
    salesCount: sales.length,
  };
}