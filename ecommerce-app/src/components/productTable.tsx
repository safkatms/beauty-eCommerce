"use client";

import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

interface Product {
  id: string;
  name: string;
  brand: { name: string };
  category: { name: string };
  subCategory: { name: string };
  sellingPrice: number;
  quantity: number | null;
  images: { imageUrl: string }[]; // Ensure images array exists
}

const ProductTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/products/delete/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete product");

        setProducts((prev) => prev.filter((product) => product.id !== id));
        toast.success("Product deleted successfully!");
      } catch (error) {
        toast.error("Error deleting product");
      }
    }
  };

  const columns: ColumnDef<Product>[] = [
    { accessorKey: "id", header: "ID", sortingFn: "alphanumeric" },
    {
      accessorKey: "images",
      header: "Image",
      cell: ({ row }) => {
        const productImages = row.original.images || [];
        const firstImage = productImages.length > 0 ? productImages[0].imageUrl : "no-image.png";
    
        return (
          <img
            src={firstImage}
            alt="Product"
            className="w-16 h-16 object-cover rounded-lg border"
            onError={(e) => (e.currentTarget.src = "/no-image.png")} // Handle missing images
          />
        );
      },
    },        
    { accessorKey: "name", header: "Product Name", sortingFn: "text" },
    { accessorKey: "brand.name", header: "Brand", sortingFn: "text" },
    { accessorKey: "category.name", header: "Category", sortingFn: "text" },
    { accessorKey: "subCategory.name", header: "SubCategory", sortingFn: "text" },
    { accessorKey: "sellingPrice", header: "Price ($)", sortingFn: "basic" },
    {
      accessorKey: "quantity",
      header: "Stock",
      cell: ({ row }) => (row.original.quantity !== null ? row.original.quantity : "Varied"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button
          onClick={() => handleDelete(row.original.id)}
          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 flex items-center justify-center"
          disabled={loading}
        >
          <Trash2 size={18} />
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: products,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full"
        />
        <p className="mt-3 text-lg text-gray-600 font-semibold animate-pulse">
          Fetching products, please wait...
        </p>
      </div>
    );

  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Product List</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 shadow-md rounded-lg">
          <thead className="bg-pink-600 text-white sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-3 text-left cursor-pointer hover:bg-pink-700 transition-all"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === "asc"
                      ? " 🔼"
                      : header.column.getIsSorted() === "desc"
                      ? " 🔽"
                      : ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-100 transition">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3 border">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center p-4 text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ProductTable;
