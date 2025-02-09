"use client";

import { useState } from "react";
import AdminSidebar from "@/components/sidebarAdmin";
import { Plus, X } from "lucide-react";
import ProductCreate from "@/components/productCreate";

export default function Products() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Manage Products</h1>

        {/* Toggle Button */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="mb-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition flex items-center gap-2"
        >
          {showCreateForm ? <X size={18} /> : <Plus size={18} />}
          {showCreateForm ? "Hide Create Form" : "Add New Product"}
        </button>

        {/* Show/Hide Create Form */}
        {showCreateForm && <ProductCreate onProductAdded={() => setShowCreateForm(false)} />}

        {/* Product List */}
        {/* <ProductTable /> */}
      </div>
    </div>
  );
}
