"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import { Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";

interface StaffMember {
  id: string;
  email: string;
  role: string;
  businessId: string;
  createdAt: string;
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [businessId, setBusinessId] = useState("");
  const auth = getAuth();
  const user = auth.currentUser;

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

  const fetchStaff = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("businessId", "==", businessId), where("role", "==", "staff"));
      const snapshot = await getDocs(q);
      const staffList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as StaffMember[];
      setStaff(staffList);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) fetchStaff();
  }, [businessId]);

  const handleAddStaff = async () => {
    if (!newStaffEmail || !businessId) {
      toast.error("Email is required");
      return;
    }
    if (!newStaffEmail.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", newStaffEmail), where("businessId", "==", businessId));
      const existing = await getDocs(q);
      if (!existing.empty) {
        toast.error("Staff with this email already exists");
        return;
      }

      await setDoc(doc(db, "users", newStaffEmail), {
        email: newStaffEmail,
        role: "staff",
        businessId: businessId,
        createdAt: new Date().toISOString(),
      });

      toast.success(`Staff added: ${newStaffEmail}. They can sign in with Google.`);
      setNewStaffEmail("");
      setShowAddModal(false);
      fetchStaff();
    } catch (error: any) {
      toast.error("Failed to add staff: " + error.message);
    }
  };

  const handleRemoveStaff = async (staffId: string, staffEmail: string) => {
    if (confirm(`Remove ${staffEmail}?`)) {
      try {
        await deleteDoc(doc(db, "users", staffId));
        toast.success("Staff removed");
        fetchStaff();
      } catch (error) {
        toast.error("Failed to remove staff");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Staff Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Add Staff
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center">Loading staff...</div>
      ) : staff.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-secondary-100">
          <p className="text-secondary-500">No staff members yet. Click "Add Staff" to invite someone.</p>
          <p className="text-secondary-400 text-sm mt-2">Staff will sign in with Google using the email you provide.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium">Email</th>
                <th className="text-left px-6 py-3 text-sm font-medium">Role</th>
                <th className="text-left px-6 py-3 text-sm font-medium">Date Added</th>
                <th className="text-center px-6 py-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id} className="border-b">
                  <td className="px-6 py-4">{member.email}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-secondary-100 rounded-full text-xs">Staff</span></td>
                  <td className="px-6 py-4 text-secondary-500">{new Date(member.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleRemoveStaff(member.id, member.email)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add Staff Member</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Staff Email (Gmail)</label>
                <input
                  type="email"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full border border-secondary-300 rounded-lg px-3 py-2"
                  placeholder="staff@gmail.com"
                />
                <p className="text-xs text-secondary-400 mt-1">Staff will sign in with Google using this email. No password needed.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button onClick={handleAddStaff} className="flex-1 btn-primary">Add Staff</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}