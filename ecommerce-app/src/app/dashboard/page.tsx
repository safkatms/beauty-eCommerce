import AdminSidebar from "@/components/sidebarAdmin";
import UserTable from "@/components/userTable";
import React from "react";

export default function Dashboard() {
  return (
    <div className="flex h-screen">
      {/* Sidebar (Fixed on the left) */}
      <AdminSidebar />

      {/* Main Content (Takes remaining space) */}
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <UserTable />
      </div>
    </div>
  );
}
