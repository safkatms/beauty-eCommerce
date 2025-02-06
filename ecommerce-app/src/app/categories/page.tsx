"use client";
import AdminSidebar from "@/components/sidebarAdmin";
import CategoryCreate from "@/components/categoryCreate";
import CategoryTable from "@/components/categoryTable";

export default function Brands() {
  return (
    <div className="flex h-screen">
      {/* Sidebar (Fixed on the left) */}
      <AdminSidebar />

      {/* Main Content (Takes remaining space) */}
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Manage Brands</h1>
        <CategoryCreate
          onCategoryAdded={() => {
            window.location.reload();
          }}
        />
        <CategoryTable />
      </div>
    </div>
  );
}
