"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, XCircle, ArrowRight } from "lucide-react";

interface Product {
  id: number;
  name: string;
  sellingPrice: number;
  priceAfterDiscount: number;
  discount: number;
  brand?: { name: string };
  images?: { imageUrl: string }[];
}

export default function ProductSearch() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Fetch search results when typing
  useEffect(() => {
    if (!query.trim()) {
      setProducts([]); // Reset results if input is empty
      return;
    }

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/products/search/dropdown?query=${query}`);
        const data = await response.json();
        setProducts(data.products || []); // Ensure array fallback
        setShowDropdown(true);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setProducts([]);
      }
    };

    const delaySearch = setTimeout(fetchResults, 300); // Debounce API calls
    return () => clearTimeout(delaySearch);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(
        `/products/searchResults?query=${encodeURIComponent(query)}`
      );
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg">
      {/* Search Input Field */}
      <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-full border border-gray-300 shadow-sm">
        <Search
          size={18}
          className="text-gray-500 cursor-pointer"
          onClick={handleSearchSubmit}
        />
        <form onSubmit={handleSearchSubmit} className="w-full">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full bg-gray-100 px-3 py-2 rounded-full focus:outline-none text-gray-700"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
          />
        </form>
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-gray-500 hover:text-red-500"
          >
            <XCircle size={18} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showDropdown && products.length > 0 && (
  <div
    ref={dropdownRef}
    className="absolute left-0 mt-2 w-full bg-white border border-gray-300 shadow-lg rounded-lg max-h-72 overflow-y-auto z-50 animate-fadeIn"
  >
    {products.slice(0, 4).map((product) => {
      const hasDiscount = product.discount && product.discount > 0;

      return (
        <div
          key={product.id}
          onClick={() => {
            router.push(`/products/details/${product.id}`);
            setShowDropdown(false);
          }}
          className="flex items-center gap-4 p-4 transition-all hover:bg-pink-50 cursor-pointer"
        >
          {/* Product Image */}
          {product.images?.length ? (
            <img
              src={product.images[0].imageUrl}
              alt={product.name}
              className="w-14 h-14 object-cover rounded-lg shadow-md border border-gray-200"
            />
          ) : (
            <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}

          {/* Product Info */}
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">{product.name}</p>
            <p className="text-xs text-gray-500">{product.brand?.name || "Unknown Brand"}</p>
          </div>

          {/* Price Display */}
          <div className="text-right">
            {hasDiscount && (
              <p className="text-xs text-gray-400 line-through">${product.sellingPrice.toFixed(2)}</p>
            )}
            <p className={`text-sm font-bold ${hasDiscount ? "text-red-600" : "text-pink-600"}`}>
              ${hasDiscount ? product.priceAfterDiscount.toFixed(2) : product.sellingPrice.toFixed(2)}
            </p>
          </div>
        </div>
      );
    })}

    {/* "View All Results" Button */}
    <button
      onClick={handleSearchSubmit}
      className="w-full py-3 text-center text-sm font-semibold text-pink-600 border-t border-gray-200 hover:bg-pink-100 transition"
    >
      View All Results
    </button>
  </div>
)}

    </div>
  );
}
