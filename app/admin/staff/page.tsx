"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "@/lib/firebase";
import { Trash2, Plus, Eye, EyeOff } from "lucide-react";
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
  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    if (!newStaffEmail || !newStaffPassword) {
      toast.error("Email and password required");
      return;
    }
    if (newStaffPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, newStaffEmail, newStaffPassword);
      const staffUser = userCredential.user;

      // Create Firestore document for staff
      await setDoc(doc(db, "users", staffUser.uid), {
        email: newStaffEmail,
        role: "staff",
        businessId: businessId,
        createdAt: new Date().toISOString(),
      });

      toast.success(`Staff created successfully! Email: ${newStaffEmail}`);
      setNewStaffEmail("");
      setNewStaffPassword("");
      setShowAddModal(false);
      fetchStaff();
    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already used. Try a different email.");
      } else {
        toast.error("Failed to create staff: " + error.message);
      }
    }
  };

  const handleRemoveStaff = async (staffId: string, staffEmail: string) => {
    if (confirm(`Remove ${staffEmail} from staff?`)) {
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Staff Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          Add Staff
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center">Loading staff...</div>
      ) : staff.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-secondary-100">
          <p className="text-secondary-500">No staff members yet. Click "Add Staff" to create one.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
            {staff.map((member) => (
              <div key={member.id} className="bg-white rounded-xl shadow-sm border border-secondary-100 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-secondary-900">{member.email}</p>
                    <span className="inline-block mt-1 px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full text-xs">Staff</span>
                  </div>
                  <button onClick={() => handleRemoveStaff(member.id, member.email)} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-secondary-500">Added: {new Date(member.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-secondary-100 overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Email</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Role</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Date Added</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id} className="border-b border-secondary-100">
                    <td className="px-6 py-4 text-secondary-900">{member.email}</td>
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
        </>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add Staff Member</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Staff Email</label>
                <input
                  type="email"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full border border-secondary-300 rounded-lg px-3 py-2"
                  placeholder="staff@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    className="w-full border border-secondary-300 rounded-lg px-3 py-2 pr-10"
                    placeholder="at least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button onClick={handleAddStaff} className="flex-1 btn-primary">Create Staff</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}