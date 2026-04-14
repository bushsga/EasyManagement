"use client";

import { useEffect, useState } from "react";
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Save, Building2, Bell, DollarSign, Key, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingProducts, setUpdatingProducts] = useState(false);
  const [businessId, setBusinessId] = useState("");
  const [settings, setSettings] = useState({
    businessName: "",
    businessType: "",
    ownerName: "",
    defaultLowStockLimit: 5,
    currency: "₦",
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const auth = getAuth();
  const user = auth.currentUser;

  // Fetch business settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        
        if (userData && userData.businessId) {
          setBusinessId(userData.businessId);
          
          const businessDoc = await getDoc(doc(db, "businesses", userData.businessId));
          const businessData = businessDoc.data();
          
          if (businessData) {
            setSettings({
              businessName: businessData.businessName || "",
              businessType: businessData.businessType || "",
              ownerName: businessData.ownerName || "",
              defaultLowStockLimit: businessData.defaultLowStockLimit || 5,
              currency: businessData.currency || "₦",
            });
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [user]);

  const handleSaveSettings = async () => {
    if (!businessId) {
      toast.error("Business ID not found");
      return;
    }
    
    setSaving(true);
    
    try {
      const businessRef = doc(db, "businesses", businessId);
      await updateDoc(businessRef, {
        businessName: settings.businessName,
        businessType: settings.businessType,
        ownerName: settings.ownerName,
        defaultLowStockLimit: settings.defaultLowStockLimit,
        currency: settings.currency,
        updatedAt: new Date().toISOString(),
      });
      
      toast.success("Settings saved successfully!");
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Apply default low stock limit to ALL existing products
  const handleApplyToAllProducts = async () => {
    if (!businessId) return;
    
    if (!confirm(`Apply "${settings.defaultLowStockLimit}" as the low stock limit to ALL existing products? This will override individual product settings.`)) {
      return;
    }
    
    setUpdatingProducts(true);
    
    try {
      // Get all products for this business
      const productsRef = collection(db, "products");
      const q = query(productsRef, where("businessId", "==", businessId));
      const snapshot = await getDocs(q);
      
      let updatedCount = 0;
      
      // Update each product
      for (const docRef of snapshot.docs) {
        await updateDoc(doc(db, "products", docRef.id), {
          lowStockLimit: settings.defaultLowStockLimit,
        });
        updatedCount++;
      }
      
      toast.success(`Updated ${updatedCount} products with new low stock limit: ${settings.defaultLowStockLimit}`);
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to update products");
    } finally {
      setUpdatingProducts(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) {
      toast.error("You must be logged in to change password");
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (!passwordData.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    
    setSaving(true);
    
    try {
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordData.newPassword);
      
      toast.success("Password updated successfully! Please login again.");
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      setTimeout(() => {
        auth.signOut();
        window.location.href = "/login";
      }, 2000);
      
    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/wrong-password") {
        toast.error("Current password is incorrect");
      } else if (error.code === "auth/requires-recent-login") {
        toast.error("Please logout and login again to change password");
      } else {
        toast.error("Failed to update password: " + error.message);
      }
    } finally {
      setSaving(false);
    }
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
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Information */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-secondary-900">Business Information</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Business Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full border border-secondary-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Business Type</label>
              <select
                value={settings.businessType}
                onChange={(e) => setSettings({ ...settings, businessType: e.target.value })}
                className="w-full border border-secondary-300 rounded-lg px-3 py-2"
              >
                <option value="">Select business type</option>
                <option value="supermarket">Supermarket / Grocery</option>
                <option value="pharmacy">Pharmacy / Drug Store</option>
                <option value="restaurant">Restaurant / Cafe</option>
                <option value="fashion">Fashion / Clothing Store</option>
                <option value="electronics">Electronics Store</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Owner Name</label>
              <input
                type="text"
                value={settings.ownerName}
                onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })}
                className="w-full border border-secondary-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>
        
        {/* Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-secondary-900">Preferences</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Default Low Stock Alert (for NEW products)
              </label>
              <div className="flex gap-3 items-start">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.defaultLowStockLimit}
                  onChange={(e) => setSettings({ ...settings, defaultLowStockLimit: parseInt(e.target.value) || 5 })}
                  className="flex-1 border border-secondary-300 rounded-lg px-3 py-2"
                />
                <button
                  onClick={handleApplyToAllProducts}
                  disabled={updatingProducts}
                  className="flex items-center gap-1 bg-secondary-100 text-secondary-700 px-3 py-2 rounded-lg hover:bg-secondary-200 disabled:opacity-50 whitespace-nowrap"
                >
                  <RefreshCw className={`h-4 w-4 ${updatingProducts ? "animate-spin" : ""}`} />
                  {updatingProducts ? "Updating..." : "Apply to All"}
                </button>
              </div>
              <p className="text-xs text-secondary-400 mt-1">
                Alert when product stock falls below this number. Click "Apply to All" to update existing products.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full border border-secondary-300 rounded-lg px-3 py-2"
              >
                <option value="₦">₦ Naira (Nigeria)</option>
                <option value="GH₵">GH₵ Cedi (Ghana)</option>
                <option value="$">$ Dollar (USA)</option>
                <option value="KES">KES Shilling (Kenya)</option>
                <option value="€">€ Euro</option>
                <option value="£">£ Pound (UK)</option>
              </select>
              <p className="text-xs text-secondary-400 mt-1">
                This affects how prices are displayed. Note: Existing products keep their prices in the original currency.
              </p>
            </div>
          </div>
        </div>
        
        {/* Change Password */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Key className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-secondary-900">Change Password</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full border border-secondary-300 rounded-lg px-3 py-2"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full border border-secondary-300 rounded-lg px-3 py-2"
                placeholder="Enter new password (min 6 chars)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full border border-secondary-300 rounded-lg px-3 py-2"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleChangePassword}
              disabled={!passwordData.newPassword || !passwordData.currentPassword || saving}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}