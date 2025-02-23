"use client";

import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";

interface Product {
  id: number;
  name: string;
  brand: { name: string };
  sellingPrice: number;
  priceAfterDiscount?: number; // Made optional
  discount?: number; // Made optional
  images: { imageUrl: string }[];
  review?: number; // Made optional
}

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const hasDiscount = product.discount && product.discount > 0;
  const productRating = product.review ?? 0; // Ensure rating is not undefined

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // Toggle Wishlist
  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  // Add to Cart
  const handleAddToCart = () => {
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 1500); // Reset button after a while
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer transition transform hover:scale-105 relative">
      {/* Wishlist Button */}
      <button
        className={`absolute top-3 right-3 p-2 rounded-full ${
          isWishlisted ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-600"
        }`}
        onClick={toggleWishlist}
      >
        <Heart size={18} />
      </button>

      {/* Product Image */}
      <img
        src={product.images[0]?.imageUrl || "/placeholder.png"}
        alt={product.name}
        className="w-full h-48 object-cover"
        onClick={() => router.push(`/products/details/${product.id}`)}
      />

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.brand?.name || "Unknown Brand"}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={16}
              className={index < productRating ? "text-yellow-500" : "text-gray-300"}
            />
          ))}
          <span className="text-sm text-gray-500 ml-1">({productRating.toFixed(1)})</span>
        </div>

        {/* Price */}
        <div className="mt-2">
          {hasDiscount && product.sellingPrice && (
            <p className="text-xs text-gray-400 line-through">${product.sellingPrice.toFixed(2)}</p>
          )}
          <p className={`text-lg font-bold ${hasDiscount ? "text-red-600" : "text-pink-600"}`}>
            ${hasDiscount && product.priceAfterDiscount !== undefined
              ? product.priceAfterDiscount.toFixed(2)
              : product.sellingPrice.toFixed(2)}
          </p>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className={`w-full mt-3 py-2 rounded-lg flex items-center justify-center gap-2 text-white ${
            isAddedToCart ? "bg-green-500" : "bg-pink-600 hover:bg-pink-700"
          } transition`}
        >
          <ShoppingBag size={18} />
          {isAddedToCart ? "Added to Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
