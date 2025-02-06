"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  Tag,
  Layers,
  ChevronDown,
} from "lucide-react";

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  return (
    <div className="relative">
      {/* Mobile Menu Button */}
      <button
        className="p-2 text-white bg-pink-700 rounded-md md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-25 left-0 h-screen w-64 bg-pink-700 text-white transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static transition-transform duration-300 z-50`}
      >
        {/* Sidebar Header */}
        <div className="p-4 text-xl font-bold border-b border-pink-500">
          Admin Panel
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col p-4 space-y-4">
          <SidebarLink
            href="/dashboard"
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
          />
          <SidebarLink
            href="/admin/products"
            icon={<Package size={20} />}
            label="Products"
          />
          <SidebarLink href="/brands" icon={<Tag size={20} />} label="Brands" />

          {/* Category Dropdown */}
          <div className="flex flex-col">
            <button
              className="flex items-center justify-between p-2 w-full text-left hover:bg-pink-500 rounded"
              onClick={() => setCategoryOpen(!categoryOpen)}
            >
              <div className="flex items-center gap-2">
                <Layers size={20} /> <span>Categories</span>
              </div>
              <ChevronDown
                className={`transition-transform duration-300 ${
                  categoryOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {categoryOpen && (
              <div className="ml-6 space-y-2">
                <SidebarLink href="/categories" label="All Categories" />
                <SidebarLink
                  href="/subCategories"
                  label="Subcategories"
                />
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

const SidebarLink = ({
  href,
  icon,
  label,
}: {
  href: string;
  icon?: React.ReactNode;
  label: string;
}) => (
  <Link
    href={href}
    className="flex items-center gap-2 p-2 hover:bg-pink-500 rounded"
  >
    {icon} <span>{label}</span>
  </Link>
);
