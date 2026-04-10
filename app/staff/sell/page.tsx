"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/lib/products";
import { recordSale } from "@/lib/sales";
import toast from "react-hot-toast";

export default function StaffSellPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [businessId, setBusinessId] = useState("");
  const auth = getAuth();
  const user = auth.currentUser;

  // Fetch businessId from user's document
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

  // Fetch products for this business
  const fetchProducts = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const productsRef = collection(db, "products");
      const q = query(productsRef, where("businessId", "==", businessId));
      const snapshot = await getDocs(q);
      const productList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productList);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchProducts();
    }
  }, [businessId]);

  const handleSellClick = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setIsModalOpen(true);
  };

  const confirmSale = async () => {
    if (!selectedProduct || !user || !businessId) return;
    if (quantity <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }
    try {
      await recordSale(selectedProduct, quantity, user.email || user.uid, businessId);
      toast.success(`Sold ${quantity} ${selectedProduct.name}(s)`);
      setIsModalOpen(false);
      // Refresh product list to update stock
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || "Sale failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-secondary-500">Loading products...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Sell Product</h1>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-12 text-center">
          <p className="text-secondary-500">No products available. Admin needs to add products first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-secondary-100 p-6 hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-secondary-900 mb-1">{product.name}</h3>
              <p className="text-sm text-secondary-500 mb-2">{product.category}</p>
              <p className="text-2xl font-bold text-primary-600 mb-1">₦{product.sellingPrice.toLocaleString()}</p>
              <p className="text-sm text-secondary-500 mb-4">
                In stock: <span className={product.currentQuantity <= product.lowStockLimit ? "text-red-600 font-medium" : ""}>{product.currentQuantity}</span>
              </p>
              <button
                onClick={() => handleSellClick(product)}
                disabled={product.currentQuantity === 0}
                className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.currentQuantity === 0 ? "Out of Stock" : "Sell"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sell Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Sell {selectedProduct.name}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Price per unit</label>
                <p className="text-lg font-semibold text-primary-600">₦{selectedProduct.sellingPrice.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.currentQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full border border-secondary-300 rounded-lg px-3 py-2"
                />
                <p className="text-xs text-secondary-400 mt-1">Max: {selectedProduct.currentQuantity}</p>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-secondary-600">Total: <span className="font-bold text-secondary-900">₦{(selectedProduct.sellingPrice * quantity).toLocaleString()}</span></p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary">Cancel</button>
                <button onClick={confirmSale} className="flex-1 btn-primary">Confirm Sale</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}