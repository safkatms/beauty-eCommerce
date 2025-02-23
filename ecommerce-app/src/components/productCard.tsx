"use client";

import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  brand: { name: string };
  sellingPrice: number;
  priceAfterDiscount: number;
  discount: number;
  images: { imageUrl: string }[];
}

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const hasDiscount = product.discount && product.discount > 0;

  return (
    <div
      className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer transition transform hover:scale-105"
      onClick={() => router.push(`/products/details/${product.id}`)}
    >
      {/* Product Image */}
      <img
        src={product.images[0]?.imageUrl || "/placeholder.png"}
        alt={product.name}
        className="w-full h-48 object-cover"
      />

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.brand?.name || "Unknown Brand"}</p>

        {/* Price */}
        <div className="mt-2">
          {hasDiscount && (
            <p className="text-xs text-gray-400 line-through">${product.sellingPrice.toFixed(2)}</p>
          )}
          <p className={`text-lg font-bold ${hasDiscount ? "text-red-600" : "text-pink-600"}`}>
            ${hasDiscount ? product.priceAfterDiscount.toFixed(2) : product.sellingPrice.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
