"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/sidebarAdmin";
import SubCategoryCreate from "@/components/subCategoryCreate";
import SubCategoryTable from "@/components/subCategoryTable";

export default function SubCategories() {
  return (
    <div className="flex h-screen">
      {/* Sidebar (Fixed on the left) */}
      <AdminSidebar />

      {/* Main Content (Takes remaining space) */}
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Manage SubCategories</h1>
        <SubCategoryCreate
          onSubCategoryAdded={() => {
            window.location.reload();
          }}
        />
        <SubCategoryTable />
      </div>
    </div>
  );
}
