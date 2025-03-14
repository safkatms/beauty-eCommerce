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
import { ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

interface Banner {
  id: number;
  imageUrl: string;
  title?: string;
  position: number;
  isActive: boolean;
}

const BannerTable = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("/api/banner");
        const data = await response.json();
        setBanners(data);
      } catch (error) {
        setError("Failed to load banners");
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const handleDelete = async (id: number) => {
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
        const response = await fetch(`/api/banner/${id}`, { method: "DELETE" });

        if (!response.ok) throw new Error("Failed to delete banner");

        setBanners((prev) => prev.filter((banner) => banner.id !== id));
        toast.success("Banner deleted successfully!");
      } catch (error) {
        toast.error("Error deleting banner");
      }
    }
  };

  const toggleActiveStatus = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/banner/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
  
      if (!response.ok) throw new Error("Failed to update banner status");
  
      setBanners((prev) =>
        prev.map((banner) => (banner.id === id ? { ...banner, isActive: !isActive } : banner))
      );
      toast.success(`Banner ${isActive ? "deactivated" : "activated"} successfully!`);
    } catch (error) {
      toast.error("Error updating banner status");
    }
  };
  
  const columns: ColumnDef<Banner>[] = [
    { accessorKey: "id", header: "ID", sortingFn: "alphanumeric" },
    {
      accessorKey: "imageUrl",
      header: "Image",
      cell: ({ row }) => (
        <div className="w-24 h-16 flex items-center justify-center">
          <img
            src={row.original.imageUrl}
            alt="Banner"
            className="w-full h-full object-cover rounded-lg border"
          />
        </div>
      ),
    },
    { accessorKey: "title", header: "Title", sortingFn: "text" },
    { accessorKey: "position", header: "Position", sortingFn: "basic" },
    {
      accessorKey: "isActive",
      header: "Active",
      cell: ({ row }) => (
        <button onClick={() => toggleActiveStatus(row.original.id, row.original.isActive)}>
          {row.original.isActive ? (
            <ToggleRight size={24} className="text-green-500" />
          ) : (
            <ToggleLeft size={24} className="text-gray-400" />
          )}
        </button>
      ),
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
    data: banners,
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
          Fetching banners, please wait...
        </p>
      </div>
    );

  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <ToastContainer /> {/* Toast notifications */}

      <h2 className="text-3xl font-bold mb-6 text-gray-800">Banner List</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search banners..."
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
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
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
                <tr
                  key={row.id}
                  className="border-b hover:bg-gray-100 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3 border">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center p-4 text-gray-500"
                >
                  No banners found.
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
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BannerTable;
