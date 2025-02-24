"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/productCard";
import ReactPaginate from "react-paginate";

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

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!query) return;

    const fetchProducts = async () => {
      setLoading(true);
      const response = await fetch(`/api/products/search/results?query=${query}&page=${page}`);
      const data = await response.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setLoading(false);
    };

    fetchProducts();
  }, [query, page]);

  // Handle page change
  const handlePageChange = ({ selected }: { selected: number }) => {
    setPage(selected + 1); // `selected` starts from 0
  };

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

          {/* Pagination using react-paginate */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <ReactPaginate
                previousLabel="← Prev"
                nextLabel="Next →"
                breakLabel="..."
                pageCount={totalPages}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageChange}
                containerClassName="flex items-center space-x-2"
                pageClassName="px-4 py-2 border rounded-md hover:bg-gray-100"
                activeClassName="bg-pink-600 text-white"
                previousClassName="px-4 py-2 border rounded-md hover:bg-gray-100"
                nextClassName="px-4 py-2 border rounded-md hover:bg-gray-100"
                disabledClassName="opacity-50 cursor-not-allowed"
              />
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500 text-lg">No results found.</p>
      )}
    </div>
  );
}
