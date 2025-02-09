"use client";

import { useState } from "react";
import AdminSidebar from "@/components/sidebarAdmin";
import SubCategoryCreate from "@/components/subCategoryCreate";
import SubCategoryTable from "@/components/subCategoryTable";
import { Plus, X } from "lucide-react"; // Import Lucide icons

export default function SubCategories() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar (Fixed on the left) */}
      <AdminSidebar />

      {/* Main Content (Takes remaining space) */}
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Manage Sub-Categories</h1>

        {/* Toggle Button */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="mb-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition flex items-center gap-2"
        >
          {showCreateForm ? <X size={18} /> : <Plus size={18} />}
          {showCreateForm ? "Hide Create Form" : "Add New Sub-Category"}
        </button>

        {/* Conditional Rendering of Create Form */}
        {showCreateForm && (
          <SubCategoryCreate
            onSubCategoryAdded={() => {
              setShowCreateForm(false); // Hide after adding
              window.location.reload(); // Refresh table
            }}
          />
        )}

        <SubCategoryTable />
      </div>
    </div>
  );
}
