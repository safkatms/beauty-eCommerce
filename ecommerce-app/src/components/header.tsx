"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import ProductSearch from "./productSearch";
import Link from "next/link";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartCount, setCartCount] = useState<number | null>(null); // Ensures it's loaded on the client
  const router = useRouter();
  const user = null; // Replace with actual authentication state

  // ✅ Ensure cart count is fetched on the client (avoiding hydration errors)
  useEffect(() => {
    setCartCount(0); // Fetch from localStorage or API later
  }, []);

  return (
    <header className="sticky top-0 w-full bg-white shadow-md z-50">
      {/* 🌟 Announcement Bar */}
      <div className="bg-pink-600 text-white text-sm text-center py-2">
        Free shipping on orders over $50!
      </div>

      {/* 🔥 Main Header */}
      <div className="container mx-auto flex items-center justify-between px-6 md:px-16 py-2">
        {/* 🌟 Logo */}
        <div
          className="text-2xl font-bold text-pink-600 cursor-pointer"
          onClick={() => router.push("/")}
        >
          GlowBeauty
        </div>

        {/* 🌟 Navigation (Desktop) */}
        <nav className="hidden md:flex space-x-6 font-medium">
          <Link href="/shop" className="hover:text-pink-600 transition">
            Shop
          </Link>
          <Link href="/skincare" className="hover:text-pink-600 transition">
            Skincare
          </Link>
          <Link href="/makeup" className="hover:text-pink-600 transition">
            Makeup
          </Link>
          <Link href="/haircare" className="hover:text-pink-600 transition">
            Haircare
          </Link>
          <Link href="/offers" className="hover:text-pink-600 transition">
            Offers
          </Link>
        </nav>

        {/* 🔍 Search Bar Component (Desktop) */}
        <div className="hidden md:block">
          <ProductSearch />
        </div>

        {/* 🌟 Icons */}
        <div className="flex items-center space-x-4">
          <Heart
            size={24}
            className="cursor-pointer text-gray-600 hover:text-pink-600"
          />

          {/* 🛒 Shopping Cart (Now Client-Safe) */}
          <div className="relative">
            <ShoppingBag
              size={24}
              className="cursor-pointer text-gray-600 hover:text-pink-600"
            />
            {cartCount !== null && (
              <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>

          {/* 🌟 Profile / Login */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-pink-600"
              >
                <User size={24} />
              </button>
              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Orders
                  </Link>
                  <button className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition"
            >
              Login
            </Link>
          )}

          {/* 🌟 Mobile Menu Toggle */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* 🌟 Mobile Navigation Menu */}
      <div
        className={`fixed inset-0 bg-white shadow-md transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:hidden`}
      >
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-pink-600"
          onClick={() => setMenuOpen(false)}
        >
          <X size={28} />
        </button>

        <div className="flex flex-col items-center space-y-6 pt-16">
          <Link
            href="/shop"
            className="text-lg font-medium hover:text-pink-600 transition"
            onClick={() => setMenuOpen(false)}
          >
            Shop
          </Link>
          <Link
            href="/skincare"
            className="text-lg font-medium hover:text-pink-600 transition"
            onClick={() => setMenuOpen(false)}
          >
            Skincare
          </Link>
          <Link
            href="/makeup"
            className="text-lg font-medium hover:text-pink-600 transition"
            onClick={() => setMenuOpen(false)}
          >
            Makeup
          </Link>
          <Link
            href="/haircare"
            className="text-lg font-medium hover:text-pink-600 transition"
            onClick={() => setMenuOpen(false)}
          >
            Haircare
          </Link>
          <Link
            href="/offers"
            className="text-lg font-medium hover:text-pink-600 transition"
            onClick={() => setMenuOpen(false)}
          >
            Offers
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
