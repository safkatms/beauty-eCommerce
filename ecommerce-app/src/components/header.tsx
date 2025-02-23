"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import ProductSearch from "./productSearch";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const user = null; // Replace with actual authentication state

  return (
    <header className="sticky top-0 bg-white shadow-md z-50">
      {/* Top Announcement Bar */}
      <div className="bg-pink-600 text-white text-sm text-center py-2">
        Free shipping on orders over $50!
      </div>

      {/* Main Header */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="text-2xl font-bold text-pink-600 cursor-pointer" onClick={() => router.push("/")}>
          GlowBeauty
        </div>

        {/* Navigation (Desktop) */}
        <nav className="hidden md:flex space-x-6 font-medium">
          <a href="#" className="hover:text-pink-600">Shop</a>
          <a href="#" className="hover:text-pink-600">Skincare</a>
          <a href="#" className="hover:text-pink-600">Makeup</a>
          <a href="#" className="hover:text-pink-600">Haircare</a>
          <a href="#" className="hover:text-pink-600">Offers</a>
        </nav>

        {/* 🔍 Search Bar Component */}
        <div className="hidden md:block">
          <ProductSearch />
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-4">
          <Heart size={24} className="cursor-pointer text-gray-600 hover:text-pink-600" />
          <ShoppingBag size={24} className="cursor-pointer text-gray-600 hover:text-pink-600" />

          {/* Profile or Login Button */}
          {user ? (
            <User size={24} className="cursor-pointer text-gray-600 hover:text-pink-600" />
          ) : (
            <a href="/login" className="px-4 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-700">
              Login
            </a>
          )}

          {/* Mobile Menu Toggle */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
