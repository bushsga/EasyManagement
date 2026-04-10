"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: any) => void;
  initialData?: any;
  businessId: string;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  businessId,
}: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    costPrice: "",
    sellingPrice: "",
    originalQuantity: "",
    currentQuantity: "",
    lowStockLimit: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        category: initialData.category || "",
        costPrice: initialData.costPrice?.toString() || "",
        sellingPrice: initialData.sellingPrice?.toString() || "",
        originalQuantity: initialData.originalQuantity?.toString() || "",
        currentQuantity: initialData.currentQuantity?.toString() || "",
        lowStockLimit: initialData.lowStockLimit?.toString() || "",
      });
    } else {
      setFormData({
        name: "",
        category: "",
        costPrice: "",
        sellingPrice: "",
        originalQuantity: "",
        currentQuantity: "",
        lowStockLimit: "5",
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseInt(formData.originalQuantity);
    const productData = {
      name: formData.name,
      category: formData.category,
      costPrice: parseFloat(formData.costPrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      originalQuantity: quantity,
      currentQuantity: initialData ? parseInt(formData.currentQuantity) : quantity,
      lowStockLimit: parseInt(formData.lowStockLimit),
      businessId,
    };
    onSave(productData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-secondary-200">
          <h2 className="text-xl font-semibold text-secondary-900">
            {initialData ? "Edit Product" : "Add New Product"}
          </h2>
          <button onClick={onClose} className="text-secondary-400 hover:text-secondary-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select category</option>
              <option value="Food">Food</option>
              <option value="Beverages">Beverages</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Cost Price *
              </label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full border border-secondary-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Selling Price *
              </label>
              <input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full border border-secondary-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Initial Stock *
              </label>
              <input
                type="number"
                name="originalQuantity"
                value={formData.originalQuantity}
                onChange={handleChange}
                required
                min="0"
                className="w-full border border-secondary-300 rounded-lg px-3 py-2"
              />
            </div>
            {initialData && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Current Stock
                </label>
                <input
                  type="number"
                  name="currentQuantity"
                  value={formData.currentQuantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full border border-secondary-300 rounded-lg px-3 py-2 bg-secondary-50"
                  readOnly={!initialData}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Low Stock Alert (quantity below)
            </label>
            <input
              type="number"
              name="lowStockLimit"
              value={formData.lowStockLimit}
              onChange={handleChange}
              min="1"
              className="w-full border border-secondary-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              {initialData ? "Update" : "Add"} Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}