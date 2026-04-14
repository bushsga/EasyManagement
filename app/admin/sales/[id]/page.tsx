"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trash2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function EditSalePage() {
  const router = useRouter();
  const params = useParams();
  const saleId = params.id as string;
  
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [updating, setUpdating] = useState(false);
  
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchSale = async () => {
      if (!saleId) return;
      const saleDoc = await getDoc(doc(db, "sales", saleId));
      if (saleDoc.exists()) {
        const data = saleDoc.data();
        setSale({ id: saleDoc.id, ...data });
        setQuantity(data.quantitySold);
        setSellingPrice(data.sellingPrice);
      }
      setLoading(false);
    };
    fetchSale();
  }, [saleId]);

  const handleUpdate = async () => {
    if (!sale) return;
    setUpdating(true);
    
    try {
      const newTotalAmount = sellingPrice * quantity;
      const costPrice = (sale.totalAmount - sale.profit) / sale.quantitySold;
      const newProfit = (sellingPrice - costPrice) * quantity;
      
      await updateDoc(doc(db, "sales", saleId), {
        quantitySold: quantity,
        sellingPrice: sellingPrice,
        totalAmount: newTotalAmount,
        profit: newProfit,
      });
      
      // Update product stock (adjust difference)
      const productRef = doc(db, "products", sale.productId);
      const productDoc = await getDoc(productRef);
      const product = productDoc.data();
      const quantityDiff = quantity - sale.quantitySold;
      
      if (product && quantityDiff !== 0) {
        await updateDoc(productRef, {
          currentQuantity: product.currentQuantity - quantityDiff,
        });
      }
      
      toast.success("Sale updated successfully");
      router.push("/admin/sales");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update sale");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this sale? This will also restore product stock.")) return;
    
    setUpdating(true);
    try {
      // Restore product stock
      const productRef = doc(db, "products", sale.productId);
      const productDoc = await getDoc(productRef);
      const product = productDoc.data();
      
      if (product) {
        await updateDoc(productRef, {
          currentQuantity: product.currentQuantity + sale.quantitySold,
        });
      }
      
      // Delete sale record
      await deleteDoc(doc(db, "sales", saleId));
      
      toast.success("Sale deleted and stock restored");
      router.push("/admin/sales");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete sale");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-secondary-500">Loading sale details...</p>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-500">Sale not found</p>
        <Link href="/admin/sales" className="text-primary-600 mt-2 inline-block">Back to Sales</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/sales" className="text-secondary-500 hover:text-secondary-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-secondary-900">Edit Sale</h1>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition"
        >
          <Trash2 className="h-4 w-4" />
          Delete Sale
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-6 max-w-md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Product</label>
            <p className="text-secondary-900 font-medium">{sale.productName}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Sold By</label>
            <p className="text-secondary-600">{sale.soldBy}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full border border-secondary-300 rounded-lg px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Selling Price (₦)</label>
            <input
              type="number"
              min="0"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
              className="w-full border border-secondary-300 rounded-lg px-3 py-2"
            />
          </div>
          
          <div className="pt-4">
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}