"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/productCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: number;
  name: string;
  brand: { name: string };
  category: { name: string };
  subCategory: { name: string };
  sellingPrice: number;
  priceAfterDiscount: number;
  discount: number;
  images: { imageUrl: string }[];
}

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!query) return;

    const fetchProducts = async () => {
      setLoading(true);
      const response = await fetch(`/api/products/search?query=${query}&page=${page}`);
      const data = await response.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setLoading(false);
    };

    fetchProducts();
  }, [query, page]);

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Search Results for "<span className="text-pink-600">{query}</span>"
      </h1>

      {loading ? (
        <p className="text-center text-gray-500 text-lg">Loading...</p>
      ) : products.length > 0 ? (
        <>
          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-4">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-full text-white transition ${
                  page === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700"
                }`}
              >
                <ChevronLeft size={20} />
              </button>

              <span className="text-lg font-semibold text-gray-700">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-full text-white transition ${
                  page === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700"
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500 text-lg">No results found.</p>
      )}
    </div>
  );
}
