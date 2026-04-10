"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getProducts, addProduct, updateProduct, deleteProduct, Product } from "@/lib/products";
import ProductModal from "@/components/ProductModal";
import toast from "react-hot-toast";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [businessId, setBusinessId] = useState<string>("");

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

  // Fetch products
  const fetchProducts = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await getProducts(businessId);
      setProducts(data);
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

  const handleAddProduct = async (productData: any) => {
    try {
      await addProduct(productData);
      toast.success("Product added successfully");
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add product");
    }
  };

  const handleUpdateProduct = async (productData: any) => {
    if (!editingProduct?.id) return;
    try {
      await updateProduct(editingProduct.id, productData);
      toast.success("Product updated successfully");
      fetchProducts();
      setEditingProduct(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product");
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await deleteProduct(productId);
        toast.success("Product deleted");
        fetchProducts();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete product");
      }
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleModalSave = async (productData: any) => {
    if (editingProduct) {
      await handleUpdateProduct(productData);
    } else {
      await handleAddProduct(productData);
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Products</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-12 text-center">
          <p className="text-secondary-500">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-12 text-center">
          <Package className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
          <p className="text-secondary-500">No products yet. Click "Add Product" to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Product</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Category</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Cost Price</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Selling Price</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">In Stock</th>
                <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-secondary-900">{product.name}</p>
                      {product.currentQuantity <= product.lowStockLimit && (
                        <p className="text-xs text-red-500 mt-1">⚠️ Low stock</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-secondary-600">{product.category}</td>
                  <td className="px-6 py-4 text-right text-secondary-600">
                    ₦{product.costPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-secondary-600">
                    ₦{product.sellingPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-medium ${product.currentQuantity <= product.lowStockLimit ? "text-red-600" : "text-secondary-900"}`}>
                      {product.currentQuantity}
                    </span>
                    <span className="text-secondary-400 text-sm"> / {product.originalQuantity}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-secondary-500 hover:text-primary-600 transition"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id!, product.name)}
                        className="text-secondary-500 hover:text-red-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleModalSave}
        initialData={editingProduct || undefined}
        businessId={businessId}
      />
    </div>
  );
}