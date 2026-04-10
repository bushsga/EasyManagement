import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export interface Product {
  id?: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  originalQuantity: number;
  currentQuantity: number;
  lowStockLimit: number;
  businessId: string;
  createdAt: string;
}

// Add product
export async function addProduct(product: Omit<Product, "id" | "createdAt">) {
  const productsRef = collection(db, "products");
  const docRef = await addDoc(productsRef, {
    ...product,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

// Get all products for a business
export async function getProducts(businessId: string): Promise<Product[]> {
  const productsRef = collection(db, "products");
  const q = query(
    productsRef,
    where("businessId", "==", businessId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
}

// Update product
export async function updateProduct(productId: string, data: Partial<Product>) {
  const productRef = doc(db, "products", productId);
  await updateDoc(productRef, data);
}

// Delete product
export async function deleteProduct(productId: string) {
  const productRef = doc(db, "products", productId);
  await deleteDoc(productRef);
}